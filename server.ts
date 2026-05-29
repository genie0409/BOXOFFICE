import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Logger middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Route: Get Daily Box Office
  app.get("/api/boxoffice", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== "string" || date.length !== 8) {
        return res.status(400).json({ error: "targetDt (YYYYMMDD) is required and must be 8 digits." });
      }
      const apiKey = process.env.KOBIS_API_KEY || "1659cae3ca3e8fabc496c94789add564";
      const url = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${date}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS Box Office API status: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Express Box Office Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal server proxy error" });
    }
  });

  // API Route: Get Movie Details
  app.get("/api/movie", async (req, res) => {
    try {
      const { movieCd } = req.query;
      if (!movieCd || typeof movieCd !== "string") {
        return res.status(400).json({ error: "movieCd parameter is required." });
      }
      const apiKey = process.env.KOBIS_API_KEY || "1659cae3ca3e8fabc496c94789add564";
      const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS Movie Info API status: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Express Movie Detail Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal server proxy error" });
    }
  });

  // Vite Dev / Production Static Assets Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || "development"})`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Startup failed:", err);
});
