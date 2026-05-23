import React, { useContext, useEffect, useState, createContext } from "react";
import { team, functions, databases } from "@/lib/appwrite";
import { Models, ID, Query } from "react-native-appwrite";
import { DatabaseIDs, RolePermissions } from "./db_models";
import { useAuth } from "./auth";
import { router, useNavigationContainerRef, useRouter, useSegments } from "expo-router";

interface CreateHouseResponse {
  data: Models.Team | undefined;
  error: any | undefined;
}

interface AddUserResponse {
  data: {} | undefined;
  error: any | undefined;
}

interface GetHouseUsersResponse {
  data: Models.MembershipList | undefined;
  error: Error | undefined;
}

interface ChangeUserRolesResponse {
    data: {} | undefined;
    error: any | undefined;
}

interface AcceptHouseInviteResponse {
    data: {} | undefined;
    error: any | undefined;
}

interface LeaveHouseResponse {
    data: {} | undefined;
    error: any | undefined;
}

interface DeleteHouseResponse {
  data: {} | undefined;
  error: any | undefined;
}

interface JoinHouseByCodeResponse {
  data: {} | undefined;
  error: any | undefined;
}

interface RemoveMemberResponse {
  data: {} | undefined;
  error: any | undefined;
}

interface UpdateRolePermissionsResponse {
  error?: any;
}

interface HouseContextValue {
  createHouse: (name: string, roles?: string[]) => Promise<CreateHouseResponse>;
  addUser: (email: string, roles?: string[]) => Promise<AddUserResponse>;
  getUsers: () => Promise<GetHouseUsersResponse>;
  changeUserRoles: (memberId: string, roles: string[]) => Promise<ChangeUserRolesResponse>;
  removeMember: (memberId: string) => Promise<RemoveMemberResponse>;
  refreshMembers: () => Promise<void>;
  acceptHouseInvite: (teamId: string, membershipId: string, secret: string) => Promise<AcceptHouseInviteResponse>;
  leaveHouse: () => Promise<LeaveHouseResponse>;
  deleteHouse: () => Promise<DeleteHouseResponse>;
  joinHouseByCode: (code: string) => Promise<JoinHouseByCodeResponse>;
  house: Models.Membership | null;
  houseTeamId: string | null;
  members: Models.Membership[];
  houseRoles: string[];
  roleOrder: string[];
  rolePermissions: Record<string, RolePermissions>;
  updateRolePermissions: (roleName: string, perms: RolePermissions) => Promise<UpdateRolePermissionsResponse>;
  updateRoleOrder: (order: string[]) => Promise<UpdateRolePermissionsResponse>;
}

interface ProviderProps {
  children: React.ReactNode;
}

const HouseContext = createContext<HouseContextValue | undefined>(undefined);

// Appwrite Function ID — set EXPO_PUBLIC_JOIN_HOUSE_FUNCTION_ID in your .env
const JOIN_HOUSE_FUNCTION_ID = process.env.EXPO_PUBLIC_JOIN_HOUSE_FUNCTION_ID ?? 'join-house';

export function HouseProvider(props: ProviderProps) {
    const [house, setHouse] = useState<Models.Membership | null>(null);
    const [houseTeamId, setHouseTeamId] = useState<string | null>(null);
    const [houseInitialized, setHouseInitialized] = useState<boolean>(false);
    const [members, setMembers] = useState<Models.Membership[]>([]);
    const [houseRoles, setHouseRoles] = useState<string[]>([]);
    const [roleOrder, setRoleOrder] = useState<string[]>([]);
    const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermissions>>({});

    const {user} = useAuth()

    const useProtectedRoute = (house: Models.Membership | null) => {
        const segments = useSegments();
        const router = useRouter();
        const [isNavigationReady, setNavigationReady] = useState(false);
        const rootNavigation = useNavigationContainerRef();

        useEffect(() => {
            const unsubscribe = rootNavigation?.addListener("state", () => {
                setNavigationReady(true);
            });
            return () => { if (unsubscribe) unsubscribe(); };
        }, [rootNavigation]);

        useEffect(() => {
            if (!isNavigationReady) return;
            const isInMainAppArea = segments[0] === "(tabs)";
            const isInAuthArea = segments[0] === "(auth)";
            if (!houseInitialized) return;
            if (isInAuthArea) return;
            if (!user) {
                router.push({ pathname: "/(auth)/sign-in" });
            } else if (!house) {
                router.push({ pathname: "/(house)" });
            } else if (house && !isInMainAppArea) {
                router.push("/(tabs)/home");
            }
        }, [house, user, segments, houseInitialized, isNavigationReady]);
    };

    // Apply all prefs fields from a raw prefs object
    function applyPrefs(prefs: any) {
        const roles: string[] = prefs?.roles ?? [];
        setHouseRoles(roles);
        setRoleOrder(prefs?.roleOrder ?? [...roles]);
        setRolePermissions(prefs?.rolePermissions ?? {});
    }

    // Re-fetch and set all house state from Appwrite (used after joining)
    async function refreshHouse() {
        if (!user) return;
        const houses = await team.list({ total: true });
        if (houses.total === 1) {
            const houseTeam = houses.teams[0];
            const houseMembers = await team.listMemberships({
                teamId: houseTeam.$id,
                queries: [Query.equal('userId', user.$id)]
            });
            setHouse(houseMembers.memberships[0]);
            setHouseTeamId(houseTeam.$id);
            applyPrefs(houseTeam.prefs);
            const allMembers = await team.listMemberships({ teamId: houseTeam.$id });
            setMembers(allMembers.memberships);
        }
    }

    async function createHouse(name: string, roles?: string[]): Promise<CreateHouseResponse> {
        try {
            if (user === null) throw new Error("Log in before creating a new house");
            if (house != null) throw new Error("Cannot create new house while a member of existing house");
            // Don't pass roles to team.create — that sets the creator's membership roles,
            // not "available roles". We store the house role list in team prefs instead.
            const response = await team.create({ teamId: ID.unique(), name });
            // Persist the defined roles in the team's prefs so any device can read them later
            const initRoles = roles ?? [];
            await team.updatePrefs({
                teamId: response.$id,
                prefs: { roles: initRoles, roleOrder: initRoles, rolePermissions: {} },
            });
            const memberships = await team.listMemberships({
                teamId: response.$id,
                queries: [Query.equal('userId', user.$id)],
                total: true
            });
            if (memberships.total != 1) throw new Error("Created team but user is not part of it");
            setHouse(memberships.memberships[0]);
            setHouseTeamId(response.$id);
            setHouseRoles(initRoles);
            setRoleOrder(initRoles);
            setRolePermissions({});
            setMembers(memberships.memberships);
            return { data: response, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function addUser(email: string, roles?: string[]): Promise<AddUserResponse> {
        try {
            if (!houseTeamId) throw new Error("Cannot invite new users to house without being in a house");
            await team.createMembership({
                teamId: houseTeamId,
                roles: roles ?? [],
                email,
                url: 'homy://accept-invite'
            });
            return { data: {}, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function getUsers(): Promise<GetHouseUsersResponse> {
        try {
            if (!houseTeamId) throw new Error("Cannot get users in the house without being in a house");
            const response = await team.listMemberships({ teamId: houseTeamId });
            return { data: response, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function changeUserRoles(memberId: string, roles: string[]): Promise<ChangeUserRolesResponse> {
        try {
            if (!houseTeamId) throw new Error("Cannot change a user's roles while not in a house");
            const updated = await team.updateMembership({ teamId: houseTeamId, membershipId: memberId, roles });
            // Reflect the change immediately in local state without a full re-fetch
            setMembers(prev => prev.map(m => m.$id === memberId ? { ...m, roles: updated.roles } : m));
            return { data: {}, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function removeMember(memberId: string): Promise<RemoveMemberResponse> {
        try {
            if (!houseTeamId) throw new Error("Not in a house");
            await team.deleteMembership({ teamId: houseTeamId, membershipId: memberId });
            setMembers(prev => prev.filter(m => m.$id !== memberId));
            return { data: {}, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function refreshMembers(): Promise<void> {
        if (!houseTeamId) return;
        try {
            const allMembers = await team.listMemberships({ teamId: houseTeamId });
            setMembers(allMembers.memberships);
        } catch (_) {}
    }

    async function acceptHouseInvite(teamId: string, membershipId: string, secret: string): Promise<AcceptHouseInviteResponse> {
        try {
            if (!user) throw new Error("Log in before accepting the house invitation");
            const response = await team.updateMembershipStatus({
                teamId, membershipId, userId: user.$id, secret
            });
            setHouse(response);
            setHouseTeamId(teamId);
            try {
                const allMembers = await team.listMemberships({ teamId });
                setMembers(allMembers.memberships);
            } catch (_) {}
            return { data: {}, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function leaveHouse(): Promise<LeaveHouseResponse> {
        try {
            if (!house || !houseTeamId) throw new Error("Cannot leave house while not part of a house");
            await team.deleteMembership({ teamId: houseTeamId, membershipId: house.$id });
            setHouse(null); setHouseTeamId(null); setMembers([]);
            setHouseRoles([]); setRoleOrder([]); setRolePermissions({});
            return { data: {}, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function deleteHouse(): Promise<DeleteHouseResponse> {
        try {
            if (!houseTeamId) throw new Error("Cannot delete house while not part of a house");

            // Delete all rows across every table that belong to this house
            const tables = [
                DatabaseIDs.TASKS,
                DatabaseIDs.EVENTS,
                DatabaseIDs.SHOP_ITEMS,
                DatabaseIDs.EXPENSES,
            ];
            await Promise.all(tables.map(async (tableId) => {
                try {
                    const { rows } = await databases.listRows({
                        databaseId: DatabaseIDs.DATABASE,
                        tableId,
                    });
                    const ours = rows.filter((r: Models.Row) => r.team_id === houseTeamId);
                    await Promise.all(ours.map((r: Models.Row) =>
                        databases.deleteRow({ databaseId: DatabaseIDs.DATABASE, tableId, rowId: r.$id })
                    ));
                } catch (_) {
                    // If a table doesn't exist yet or has no rows, continue
                }
            }));

            await team.delete({ teamId: houseTeamId });
            setHouse(null); setHouseTeamId(null); setMembers([]);
            setHouseRoles([]); setRoleOrder([]); setRolePermissions({});
            return { data: {}, error: undefined };
        } catch (error) {
            return { data: undefined, error: error as Error };
        }
    }

    async function updateRolePermissions(roleName: string, perms: RolePermissions): Promise<UpdateRolePermissionsResponse> {
        try {
            if (!houseTeamId) throw new Error("Not in a house");
            const newPerms = { ...rolePermissions, [roleName]: perms };
            await team.updatePrefs({
                teamId: houseTeamId,
                prefs: { roles: houseRoles, roleOrder, rolePermissions: newPerms },
            });
            setRolePermissions(newPerms);
            return {};
        } catch (error) {
            return { error };
        }
    }

    async function updateRoleOrder(order: string[]): Promise<UpdateRolePermissionsResponse> {
        try {
            if (!houseTeamId) throw new Error("Not in a house");
            await team.updatePrefs({
                teamId: houseTeamId,
                prefs: { roles: houseRoles, roleOrder: order, rolePermissions },
            });
            setRoleOrder(order);
            return {};
        } catch (error) {
            return { error };
        }
    }

    async function joinHouseByCode(code: string): Promise<JoinHouseByCodeResponse> {
        try {
            if (!user) throw new Error("You must be logged in to join a house");
            if (house) throw new Error("You are already in a house");
            const cleanCode = code.replace(/-/g, '').trim();
            if (!cleanCode) throw new Error("Invalid code");

            console.log('[joinHouseByCode] calling function', JOIN_HOUSE_FUNCTION_ID, 'with teamId', cleanCode);

            const execution = await functions.createExecution(
                JOIN_HOUSE_FUNCTION_ID,
                JSON.stringify({ teamId: cleanCode }),
                false // synchronous
            );

            console.log('[joinHouseByCode] execution status:', execution.status, 'statusCode:', execution.responseStatusCode, 'body:', execution.responseBody);

            if (execution.status === 'failed') {
                throw new Error('Function execution failed — check Appwrite console logs');
            }
            if (execution.status !== 'completed') {
                throw new Error(`Unexpected execution status: ${execution.status}`);
            }

            let result: any;
            try {
                result = JSON.parse(execution.responseBody);
            } catch {
                throw new Error(`Could not parse function response: ${execution.responseBody}`);
            }

            if (!result.success) throw new Error(result.error ?? 'Could not join house');

            // Refresh house state so the app reflects the new membership
            await refreshHouse();
            return { data: {}, error: undefined };
        } catch (error) {
            console.log('[joinHouseByCode] error:', error);
            return { data: undefined, error };
        }
    }

    useEffect(() => {
        if (!user) {
            setHouse(null);
            setMembers([]);
            setHouseInitialized(true);
            return;
        }
        (async () => {
          try {
            const houses = await team.list({ total: true });
            if (houses.total > 1) throw new Error("User belongs to more than 1 house");
            if (houses.total == 1) {
                const houseTeam = houses.teams[0];
                const houseMembers = await team.listMemberships({
                    teamId: houseTeam.$id,
                    queries: [Query.equal('userId', user.$id)]
                });
                setHouse(houseMembers.memberships[0]);
                setHouseTeamId(houseTeam.$id);
                applyPrefs(houseTeam.prefs);
                const allMembers = await team.listMemberships({ teamId: houseTeam.$id });
                setMembers(allMembers.memberships);
            } else {
                setHouse(null); setHouseTeamId(null); setMembers([]);
                setHouseRoles([]); setRoleOrder([]); setRolePermissions({});
            }
          } catch (error) {
            console.log("error", error);
            setHouse(null);
          }
          setHouseInitialized(true);
        })();
    }, [user?.$id]);

    useProtectedRoute(house);

    return (
        <HouseContext.Provider value={{
            createHouse,
            addUser,
            getUsers,
            changeUserRoles,
            removeMember,
            refreshMembers,
            acceptHouseInvite,
            leaveHouse,
            deleteHouse,
            joinHouseByCode,
            updateRolePermissions,
            updateRoleOrder,
            house,
            houseTeamId,
            members,
            houseRoles,
            roleOrder,
            rolePermissions,
        }}>
            {props.children}
        </HouseContext.Provider>
    );
}

export const useHouse = () => {
  const houseContext = useContext(HouseContext);
  if (!houseContext) {
    throw new Error("useHouse must be used within an HouseContextProvider");
  }
  return houseContext;
};
