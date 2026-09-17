import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-sm rounded bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Iniciar sesion</h1>

        <form className="space-y-4">
          <TextField fullWidth label="Correo" name="email" type="email" size="small" />
          <TextField fullWidth label="Contraseña" name="password" type="password" size="small" />
          <Button fullWidth type="submit" variant="contained">
            Entrar
          </Button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;

