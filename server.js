import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const distPath = path.resolve(__dirname, 'dist');

  // Serve static files from dist if it exists
  if (fs.existsSync(distPath)) {
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
  }

  // Vite middleware for development (only if dist doesn't exist)
  if (process.env.NODE_ENV !== "production" && !fs.existsSync(distPath)) {
    console.log("Starting in development mode with Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // SPA Fallback for production or when dist exists
    app.get('*', (req, res) => {
      if (fs.existsSync(path.join(distPath, 'index.html'))) {
        res.sendFile(path.join(distPath, 'index.html'));
      } else {
        res.status(503).send("O site está sendo preparado. Por favor, aguarde 30 segundos e recarregue a página.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();
