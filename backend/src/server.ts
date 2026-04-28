import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { PORT } from "./secrets.js";
import routes from "./routes/index.js";
import { securityMiddleware, authRateLimiter } from "./middlewares/security.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { NotFoundError } from "./errors/app-error.js";
import { setupSwagger } from "./swagger.js";

const app: Express = express();

//Les parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Sécurité (Helmet + CORS + Rate Limit global)
app.use(securityMiddleware);

setupSwagger(app);

//Rate limit strict sur les routes d'authentification
app.use("/api/v1/auth", authRateLimiter);

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes 
app.use("/api/v1", routes);

// 404 Route introuvable 
app.all(/.*/, (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} introuvable`));
});

// Gestion d'erreurs globale 
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Serveur TrackIt démarré sur le port ${PORT}`);
});

export default app;
