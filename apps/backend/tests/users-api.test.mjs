import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { AppDataSource } from '../src/config/db.js';
import { SucursalSchema, UsuarioSchema } from '../src/entities/Laboratorio.js';

test('cuentas autenticadas, registro por administrador y acceso a solicitudes', async (t) => {
  await AppDataSource.initialize();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/api`;
  const branchId = randomUUID(), otherBranchId = randomUUID(), adminId = randomUUID(), supervisorId = randomUUID();
  const correo = `prueba-${randomUUID()}@example.test`, password = randomUUID();
  const token = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const adminToken = token(adminId);
  const form = { nombre: ' Prueba de API ', apellidos: ' Temporal ', correo, password, rol: 'recepcion', sucursalId: otherBranchId };
  const send = (path, body, auth = adminToken) => fetch(`${url}${path}`, {
    method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let created;
  try {
    await AppDataSource.getRepository(SucursalSchema).save([branchId, otherBranchId].map((id) => ({ id, nombre: `Cuenta ${id}`, direccion: 'Temporal' })));
    await AppDataSource.getRepository(UsuarioSchema).save([
      { id: adminId, rol: 'administrador' }, { id: supervisorId, rol: 'supervisor' },
    ].map((user) => ({ ...user, sucursalId: branchId, nombre: 'Prueba cuentas', correo: `${user.id}@example.test`, password: 'hash-fixture' })));
    await t.test('health verifica la conexion', async () => {
      assert.equal((await (await send('/health')).json()).baseDeDatos, 'conectada');
    });
    await t.test('protege registro, listado y opciones segun sesion y rol', async () => {
      for (const path of ['/usuarios', '/usuarios/opciones-registro', '/auth/me']) assert.equal((await send(path, null, null)).status, 401);
      assert.equal((await send('/usuarios', form, null)).status, 401);
      assert.equal((await send('/usuarios', form, token(supervisorId))).status, 403);
      assert.equal((await send('/usuarios/opciones-registro', null, token(supervisorId))).status, 403);
      const options = await (await send('/usuarios/opciones-registro')).json();
      assert.ok(options.sucursales.some((branch) => branch.id === otherBranchId));
      assert.ok(options.roles.includes('recepcion'));
    });
    await t.test('crea cuenta en sucursal elegida, cifra contrasena y no devuelve hash', async () => {
      const response = await send('/usuarios', { ...form, estatus: 'inactivo' });
      assert.equal(response.status, 201);
      created = await response.json();
      assert.equal(created.nombre, 'Prueba de API');
      assert.equal(created.apellidos, 'Temporal');
      assert.equal(created.sucursalId, otherBranchId);
      assert.equal(created.estatus, 'activo');
      assert.equal(created.password, undefined);
      const saved = await AppDataSource.getRepository(UsuarioSchema).createQueryBuilder('u').addSelect('u.password').where('u.id = :id', { id: created.id }).getOneOrFail();
      assert.notEqual(saved.password, password);
      assert.ok(await bcrypt.compare(password, saved.password));
      const listed = await (await send('/usuarios')).json();
      assert.ok(listed.some((user) => user.id === created.id));
      assert.ok(listed.every((user) => user.password === undefined));
      const scoped = await (await send('/usuarios', null, token(supervisorId))).json();
      assert.ok(scoped.every((user) => user.sucursalId === branchId));
      assert.equal((await send('/usuarios', null, token(created.id))).status, 403);
    });
    await t.test('rechaza duplicados y campos invalidos sin crear cuentas', async () => {
      assert.equal((await send('/usuarios', { ...form, correo: correo.toUpperCase() })).status, 409);
      for (const extra of [{ rol: 'desconocido' }, { sucursalId: '' }, { nombre: ' ' }, { correo: 'sin-correo' }, { password: '        ' }, { password: 'á'.repeat(37) }]) {
        assert.equal((await send('/usuarios', { ...form, ...extra })).status, 400);
      }
      assert.equal((await send('/usuarios', { ...form, correo: `${randomUUID()}@example.test`, sucursalId: randomUUID() })).status, 400);
    });
    await t.test('login real normaliza correo y permite entrar al listado de solicitudes', async () => {
      const response = await send('/auth/login', { correo: ` ${correo.toUpperCase()} `, password }, null);
      assert.equal(response.status, 200);
      const { token: auth } = await response.json();
      const me = await (await send('/auth/me', null, auth)).json();
      assert.equal(me.id, created.id);
      assert.equal(me.sucursalId, otherBranchId);
      assert.equal(me.password, undefined);
      const list = await (await send('/solicitudes-estudios', null, auth)).json();
      assert.equal(list.usuario.id, created.id);
      assert.equal(list.total, 0);
    });
    await t.test('credenciales incorrectas devuelven el mismo mensaje y no una sesion', async () => {
      const wrong = await send('/auth/login', { correo, password: 'incorrecta' }, null);
      const missing = await send('/auth/login', { correo: `${randomUUID()}@example.test`, password }, null);
      assert.equal(wrong.status, 401);
      assert.equal(missing.status, 401);
      assert.deepEqual(await wrong.json(), await missing.json());
      assert.equal((await send('/auth/login', { correo, password: '' }, null)).status, 400);
    });
    await t.test('revalida cuenta y sucursales al ingresar y al registrar', async () => {
      await AppDataSource.getRepository(UsuarioSchema).update(created.id, { estatus: 'inactivo' });
      assert.equal((await send('/auth/login', { correo, password }, null)).status, 403);
      await AppDataSource.getRepository(UsuarioSchema).update(created.id, { estatus: 'activo' });
      await AppDataSource.getRepository(SucursalSchema).update(otherBranchId, { estatus: 'inactivo' });
      assert.equal((await send('/auth/login', { correo, password }, null)).status, 403);
      assert.equal((await send('/auth/me', null, token(created.id))).status, 403);
      const options = await (await send('/usuarios/opciones-registro')).json();
      assert.ok(!options.sucursales.some((branch) => branch.id === otherBranchId));
      assert.equal((await send('/usuarios', { ...form, correo: `${randomUUID()}@example.test` })).status, 400);
      await AppDataSource.getRepository(SucursalSchema).update(otherBranchId, { estatus: 'activo', expiresAt: new Date('2000-01-01') });
      assert.equal((await send('/auth/login', { correo, password }, null)).status, 403);
      await AppDataSource.getRepository(SucursalSchema).update(otherBranchId, { expiresAt: null });
      await AppDataSource.getRepository(UsuarioSchema).update(adminId, { rol: 'recepcion' });
      assert.equal((await send('/usuarios', form)).status, 403);
    });
  } finally {
    await AppDataSource.query('DELETE FROM laboratorio.usuarios WHERE correo=$1 OR id = ANY($2::uuid[])', [correo, [adminId, supervisorId]]);
    await AppDataSource.getRepository(SucursalSchema).delete([branchId, otherBranchId]);
    await new Promise((resolve) => server.close(resolve));
    await AppDataSource.destroy();
  }
});
