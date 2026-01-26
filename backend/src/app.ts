import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/error.middleware";

export function createApp() {
    const app = express();

    app.use(cors({
        origin: ['http://localhost:5000', 'http://localhost:3000'],
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    registerRoutes(app);

    app.use(errorHandler);

    return app;
}