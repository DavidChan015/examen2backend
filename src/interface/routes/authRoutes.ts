import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";

const authController = new AuthController();
const authRoutes = Router();

authRoutes.post("/register", (req, res) => authController.register(req, res));
authRoutes.post(["/login", "/auth/login"], (req, res) => authController.login(req, res));

export default authRoutes;
