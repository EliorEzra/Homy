import { Permission, Role } from "react-native-appwrite"


type PermissionGroup = {
    users: string[]
    roles: string[]
}

export function getPermissions(
        teamId: string, 
        readPerms: PermissionGroup, 
        updatePerms: PermissionGroup, 
        deletePerms: PermissionGroup) {
    return [
        ...readPerms.users.map((user) => Permission.read(Role.user(user))),
        ...readPerms.roles.map((role) => Permission.read(Role.team(teamId, role))),
        ...updatePerms.users.map((user) => Permission.update(Role.user(user))),
        ...updatePerms.roles.map((role) => Permission.update(Role.team(teamId, role))),
        ...deletePerms.users.map((user) => Permission.delete(Role.user(user))),
        ...deletePerms.roles.map((role) => Permission.delete(Role.team(teamId, role))),
    ]
}