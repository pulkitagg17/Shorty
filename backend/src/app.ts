import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    registerRoutes(app);

    app.use((err: any, req: any, res: any, next: any) => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    });

    return app;
}