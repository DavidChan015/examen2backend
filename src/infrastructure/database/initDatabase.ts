import { connectDB } from "./sequelize.js";
import { sequelize } from "./sequelize.js";
import { registerModels } from "../models/index.js";
import { DataTypes } from "sequelize";

export const initDatabase = async () => {
    await connectDB();
    registerModels();

    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const userTableExists = tables.some((table) => String(table).toLowerCase() === "users");
    if (userTableExists) {
        let userColumns = await queryInterface.describeTable("users");
        const legacyColumns = [
            ["nombre", "name"],
            ["usuario", "username"],
            ["password_hash", "password"],
            ["createdAt", "created_at"],
        ] as const;

        for (const [legacyName, currentName] of legacyColumns) {
            if (legacyName in userColumns && !(currentName in userColumns)) {
                await queryInterface.renameColumn("users", legacyName, currentName);
                userColumns = await queryInterface.describeTable("users");
                console.log(`Renamed "users.${legacyName}" to "users.${currentName}".`);
            }
        }

        for (const legacyName of ["apellido", "updatedAt"]) {
            if (legacyName in userColumns && !userColumns[legacyName].allowNull) {
                await queryInterface.changeColumn("users", legacyName, {
                    type: userColumns[legacyName].type,
                    allowNull: true,
                });
            }
        }
    }

    await sequelize.sync();
    console.log("Database initialized successfully.");
};