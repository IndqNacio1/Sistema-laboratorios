export function loginUser(credentials) {
  const { email, password } = credentials ?? {};

  if (!email || !password) {
    return {
      statusCode: 400,
      body: {
        message: 'Correo y contraseña son obligatorios.',
      },
    };
  }

  return {
    statusCode: 501,
    body: {
      message: 'Autenticacion pendiente de implementar.',
    },
  };
}

