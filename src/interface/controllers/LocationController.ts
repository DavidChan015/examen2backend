import { Request, Response } from "express";
import { LocationService } from "../../infrastructure/services/LocationService.js";

const locationService = new LocationService();

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCoordinate = (value: unknown, minimum: number, maximum: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;

const respondWithError = (res: Response, message: string, error: unknown): void => {
  console.error(message, error);
  res.status(500).json({ message: "Error interno del servidor." });
};

export class LocationController {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.authenticatedUserId) {
      res.status(401).json({ message: "Autenticación requerida." });
      return;
    }

    const body: unknown = req.body;
    if (!isRecord(body)) {
      res.status(400).json({ message: "El cuerpo de la solicitud no es válido." });
      return;
    }

    const { name, description, latitude, longitude } = body;
    if (typeof name !== "string" || !name.trim() || name.trim().length > 255 ||
        typeof description !== "string" || !description.trim() ||
        !isCoordinate(latitude, -90, 90) ||
        !isCoordinate(longitude, -180, 180)) {
      res.status(400).json({
        message: "Envía name, description, latitude y longitude con valores válidos.",
      });
      return;
    }

    try {
      const location = await locationService.create({
        name: name.trim(),
        description: description.trim(),
        latitude,
        longitude,
      }, req.authenticatedUserId);
      res.status(201).json({
        id: location.id,
        name: location.name,
        description: location.description,
        latitude: location.latitude,
        longitude: location.longitude,
        created_at: location.created_at,
      });
    } catch (error) {
      respondWithError(res, "Error al guardar la ubicación:", error);
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    if (!req.authenticatedUserId) {
      res.status(401).json({ message: "Autenticación requerida." });
      return;
    }

    try {
      const locations = await locationService.listForUser(req.authenticatedUserId);
      res.status(200).json(locations);
    } catch (error) {
      respondWithError(res, "Error al consultar las ubicaciones:", error);
    }
  }
}
