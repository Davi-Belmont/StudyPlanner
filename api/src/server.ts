// Precisa ser o primeiro import: carrega o .env antes de qualquer outro módulo
import "dotenv/config";

import app from "./app";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET não definido. Configure o arquivo .env (veja .env.example).");
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`StudyPlanner API rodando na porta ${PORT}`);
  console.log(`Documentação: http://localhost:${PORT}/docs`);
});
