import express from "express";
import cors from "cors";
import authRoutes from "./src/interface/routes/authRoutes.js";
import locationRoutes from "./src/interface/routes/locationRoutes.js";

export const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "*",
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  methods: ["GET", "POST", "OPTIONS"],
}));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/locations", locationRoutes);
