import express from "express";
import cors    from "cors";
import path    from "path";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes     from "./modules/auth/auth.routes.js";
import farmersRoutes  from "./modules/farmers/farmers.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import ordersRoutes   from "./modules/orders/orders.routes.js";
import surveysRoutes  from "./modules/surveys/surveys.routes.js";
import adminRoutes    from "./modules/admin/admin.routes.js";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

app.use("/api/auth",     authRoutes);
app.use("/api/farmers",  farmersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders",   ordersRoutes);
app.use("/api/surveys",  surveysRoutes);
app.use("/api/admin",    adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

export default app;