import express from "express";
import identifyRoutes from "./routes/identifyRoutes";

const app = express();

app.use(express.json());
app.use("/api", identifyRoutes);

export default app;
