import { Models } from "react-native-appwrite";
import { RolePermissions } from "./db_models";


export type UserPreferences = Models.DefaultPreferences & Record<string, unknown> & {
    theme?: string
}

export type HousePreferences = Models.DefaultPreferences & Record<string, unknown> & {
    roles?: string[],
    roleOrder?: string[],
    hierarchyEnabled?: boolean,
    rolePermissions?: Record<string, RolePermissions>
}