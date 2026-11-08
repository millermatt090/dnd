import path from "node:path";

import express from "express";

import { rollRoutes } from "./roll/roll-routes.js";

const PORT = Number(process.env["PORT"] ?? 8000);

// Built Angular app. Docker sets CLIENT_DIR; locally it is dist/ at the project root.
const CLIENT_DIR =
    process.env["CLIENT_DIR"] ?? path.resolve(import.meta.dirname, "../../dist/client/browser");

const app = express();
app.disable("x-powered-by");

app.use("/api", rollRoutes);

app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
});

app.use(express.static(CLIENT_DIR));

app.listen(PORT, () => {
    console.log(`Dice roller listening on http://localhost:${PORT}`);
});
