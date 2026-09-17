import { loginUser } from '../services/auth.service.js';

export function login(request, response) {
  const result = loginUser(request.body);

  response.status(result.statusCode).json(result.body);
}

