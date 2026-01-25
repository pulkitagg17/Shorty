import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/error.middleware";

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());

    registerRoutes(app);

    app.use(errorHandler);

    return app;
}