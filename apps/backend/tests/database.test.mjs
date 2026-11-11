import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppDataSource } from '../src/config/db.js';
import { laboratorioEntities, UsuarioSchema, PacienteSchema, ServicioSchema,
  ProductoSchema, EstudioPacienteSchema } from '../src/entities/Laboratorio.js';

test('modelo relacional y restricciones en PostgreSQL', async (t) => {
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  try {
    await t.test('los once modelos se pueden consultar', async () => {
      assert.equal(laboratorioEntities.length, 11);
      for (const schema of laboratorioEntities) await runner.manager.getRepository(schema).find({ take: 1 });
    });
    const user = await runner.manager.getRepository(UsuarioSchema).save({
      nombre: 'Prueba transaccional', correo: `db-${Date.now()}@example.test`, password: 'hash-de-prueba', rol: 'administrador',
    });
    const patient = await runner.manager.getRepository(PacienteSchema).save({ nombre: 'Paciente de prueba', apellidos: 'Temporal' });
    const service = await runner.manager.getRepository(ServicioSchema).save({ nombre: 'Servicio temporal', precio: '100.00' });
    const product = await runner.manager.getRepository(ProductoSchema).save({ articulo: 'Producto temporal', cantidad: '5.000', unidad_medida: 'pieza' });
    const study = await runner.manager.getRepository(EstudioPacienteSchema).save({ pacienteId: patient.id, servicioId: service.id, usuarioId: user.id });
    await t.test('estudio clinico conserva sus tres relaciones', async () => {
      assert.equal(study.pacienteId, patient.id);
      assert.equal(study.servicioId, service.id);
      assert.equal(study.usuarioId, user.id);
    });
    const expectCode = async (sql, params, code) => {
      await runner.query('SAVEPOINT comprobacion');
      await assert.rejects(runner.query(sql, params), (error) => error.code === code);
      await runner.query('ROLLBACK TO SAVEPOINT comprobacion');
      await runner.query('RELEASE SAVEPOINT comprobacion');
    };
    await t.test('correo unico sin distinguir mayusculas', async () => {
      await expectCode('INSERT INTO laboratorio.usuarios (nombres, correo, contrasena_hash) VALUES ($1,$2,$3)',
        ['Duplicado', user.correo.toUpperCase(), 'hash-de-prueba'], '23505');
    });
    await t.test('rechaza relaciones inexistentes e inventario negativo', async () => {
      await expectCode("INSERT INTO laboratorio.estudios (paciente_id,servicio_id,usuario_id) VALUES (gen_random_uuid(),$1,$2)", [service.id, user.id], '23503');
      await expectCode('UPDATE laboratorio.productos SET stock=-1 WHERE id=$1', [product.id], '23514');
    });
    await t.test('un estudio no puede tener dos pagos', async () => {
      const sql = "INSERT INTO laboratorio.pagos (estudio_id,usuario_id,monto,metodo_pago) VALUES ($1,$2,100,'efectivo')";
      await runner.query(sql, [study.id, user.id]);
      await expectCode(sql, [study.id, user.id], '23505');
    });
    await t.test('rechaza movimientos financieros sin cuenta', async () => {
      await expectCode("INSERT INTO laboratorio.movimientos_financieros (usuario_id,tipo,concepto,monto,monto_inicial,monto_ajuste,monto_final) VALUES ($1,'ingreso','Prueba',100,0,100,100)", [user.id], '23514');
    });
    await t.test('las consultas no exponen la contrasena', async () => {
      const selected = await runner.manager.getRepository(UsuarioSchema).findOneByOrFail({ id: user.id });
      assert.equal(selected.password, undefined);
    });
  } finally {
    await runner.rollbackTransaction();
    await runner.release();
    await AppDataSource.destroy();
  }
});
