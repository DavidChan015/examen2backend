import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";

export class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public username!: string | null;
    public password!: string;
    public created_at!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER, 
            
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: false,
    }
);
