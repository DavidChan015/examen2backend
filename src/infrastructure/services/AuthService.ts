import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { getJwtSecret } from "../../config/auth.js";
import { User } from "../models/UserModel.js";

export interface RegistrationInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface PublicUser {
  id: number;
  email: string;
  username: string;
}

export class AuthService {
  async register(input: RegistrationInput): Promise<{ token: string; user: PublicUser }> {
    const user = await User.create({
      name: input.name,
      username: input.username,
      email: input.email,
      password: await bcrypt.hash(input.password, 12),
    });

    return {
      token: this.createToken(user.id),
      user: this.toPublicUser(user),
    };
  }

  async login(usernameOrEmail: string, password: string): Promise<{ token: string; user: PublicUser } | null> {
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: usernameOrEmail.toLowerCase() },
          { username: usernameOrEmail },
        ],
      },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    return {
      token: this.createToken(user.id),
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username ?? "",
    };
  }

  private createToken(userId: number): string {
    return jwt.sign({ sub: String(userId) }, getJwtSecret(), { expiresIn: "24h" });
  }
}
