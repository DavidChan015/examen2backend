import { User } from "./UserModel.js";
import { Location } from "./LocationModel.js";

export const registerModels = () => {
    User.hasMany(Location, { foreignKey: "user_id", as: "locations", onDelete: "CASCADE" });
    Location.belongsTo(User, { foreignKey: "user_id", as: "user" });

    return { User, Location };
};
