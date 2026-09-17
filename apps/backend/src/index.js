import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'sistema-laboratorios-api',
  });
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});

