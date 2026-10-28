import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthService, RegistrationInput } from "../../infrastructure/services/AuthService.js";

const authService = new AuthService();

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const respondWithError = (res: Response, message: string, error: unknown): void => {
  console.error(message, error);
  res.status(500).json({ message: "Error interno del servidor." });
};

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const body: unknown = req.body;
    if (!isRecord(body)) {
      res.status(400).json({ message: "El cuerpo de la solicitud no es válido." });
      return;
    }

    const username = body.username ?? body.usuario;
    const email = body.email ?? username;
    const name = body.name ?? body.nombre ?? username;
    const password = body.password;
    if (!isNonEmptyString(username) || !isNonEmptyString(email) ||
        !isNonEmptyString(name) || !isNonEmptyString(password)) {
      res.status(400).json({ message: "username, email y password son obligatorios." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    const normalizedName = name.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        normalizedEmail.length > 254 ||
        normalizedUsername.length > 50 ||
        normalizedName.length > 100 ||
        Buffer.byteLength(password) < 8 ||
        Buffer.byteLength(password) > 72) {
      res.status(400).json({
        message: "Revisa el email, la longitud de los campos y que password tenga entre 8 y 72 bytes.",
      });
      return;
    }

    const input: RegistrationInput = {
      name: normalizedName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    };

    try {
      const result = await authService.register(input);
      res.status(201).json({ message: "Registro exitoso.", ...result });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        res.status(409).json({ message: "El email o el usuario ya está registrado." });
        return;
      }
      respondWithError(res, "Error al registrar usuario:", error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const body: unknown = req.body;
    const username = isRecord(body) ? body.username ?? body.email : undefined;
    const password = isRecord(body) ? body.password : undefined;
    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
      res.status(400).json({ message: "username y password son obligatorios." });
      return;
    }

    try {
      const result = await authService.login(username.trim(), password);
      if (!result) {
        res.status(401).json({ message: "Credenciales incorrectas." });
        return;
      }
      res.status(200).json({
        ...result,
        message: "Autenticación exitosa",
      });
    } catch (error) {
      respondWithError(res, "Error al iniciar sesión:", error);
    }
  }
}
