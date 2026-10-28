import { Location } from "../models/LocationModel.js";

export interface LocationInput {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

export class LocationService {
  async create(input: LocationInput, userId: number): Promise<Location> {
    return Location.create({ ...input, user_id: userId });
  }

  async listForUser(userId: number): Promise<Location[]> {
    return Location.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"], ["id", "DESC"]],
      attributes: ["id", "name", "description", "latitude", "longitude", "created_at"],
    });
  }
}
