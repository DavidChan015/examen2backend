import { Router } from "express";
import { LocationController } from "../controllers/LocationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const locationController = new LocationController();
const locationRoutes = Router();

locationRoutes.post("/", requireAuth, (req, res) => locationController.create(req, res));
locationRoutes.get("/", requireAuth, (req, res) => locationController.list(req, res));

export default locationRoutes;
