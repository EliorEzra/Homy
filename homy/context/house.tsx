import React, { useContext, useEffect, useState, createContext } from "react";
import { team } from "@/lib/appwrite";
import { Models, ID, Query } from "react-native-appwrite";
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

interface HouseContextValue {
  createHouse: (name: string, roles?: string[]) => Promise<CreateHouseResponse>;
  addUser: (email: string, roles?: string[]) => Promise<AddUserResponse>;
  getUsers: () => Promise<GetHouseUsersResponse>;
  changeUserRoles: (memberId: string, roles: string[]) => Promise<ChangeUserRolesResponse>;
  acceptHouseInvite: (teamId: string, secret: string) => Promise<AcceptHouseInviteResponse>;
  leaveHouse: () => Promise<LeaveHouseResponse>;
  deleteHouse: () => Promise<DeleteHouseResponse>;
  house: Models.Membership | null;
  houseTeamId: string | null;
  members: Models.Membership[];
}

interface ProviderProps {
  children: React.ReactNode;
}

const HouseContext = createContext<HouseContextValue | undefined>(
  undefined
);

export function HouseProvider(props: ProviderProps) {
    const [house, setHouse] = useState<Models.Membership | null>(null);
    const [houseTeamId, setHouseTeamId] = useState<string | null>(null);
    const [houseInitialized, setHouseInitialized] = useState<boolean>(false);
    const [members, setMembers] = useState<Models.Membership[]>([]);

    const {user} = useAuth()
    // This hook will protect the route access based on if the user has a house.
    const useProtectedRoute = (house: Models.Membership | null) => {
        const segments = useSegments();
        const router = useRouter();

        // checking that navigation is all good;
        const [isNavigationReady, setNavigationReady] = useState(false);
        const rootNavigation = useNavigationContainerRef();

        useEffect(() => {
            const unsubscribe = rootNavigation?.addListener("state", (event) => {
            setNavigationReady(true);
            });
            return function cleanup() {
            if (unsubscribe) {
                unsubscribe();
            }
            };
        }, [rootNavigation]);

        useEffect(() => {
            if (!isNavigationReady) {
            return;
            }
            const isInMainAppArea = segments[0] === "(tabs)";
            const isInAuthArea = segments[0] === "(auth)";
            if (!houseInitialized) return;
            if (isInAuthArea) return;
            // If there's no user (and we're somehow here)
            if (!user) {
                router.push({pathname: "/(auth)/sign-in"})
            }
            else if (
            // If the user is does not have a house and the initial segment is not the main app area (tabs).
            !house
            ) {
            // Redirect to the house creation page page.
            router.push({pathname: "/(house)"});
            } else if (house && !isInMainAppArea) {
            // Redirect away from the house creation page.
            router.push("/(tabs)/home");
            }
        }, [house, user, segments, houseInitialized, isNavigationReady]);
    };

    async function createHouse(name: string, roles?: string[]): Promise<CreateHouseResponse> {
        try {
            if (user === null) {
                throw new Error("Log in before creating a new house")
            }
            if(house != null) {
                throw new Error("Cannot create new house while a member of existing house");
            }
            const response = await team.create({
                teamId: ID.unique(),
                name: name,
                roles: roles
            })
            const memberships = await team.listMemberships({
                teamId: response.$id,
                queries: [Query.equal('userId', user.$id)],
                total: true
            })
            if (memberships.total != 1) {
                throw new Error("Created team but user is not part of it")
            }
            setHouse(memberships.memberships[0])
            setHouseTeamId(response.$id)
            setMembers(memberships.memberships)
            return {data: response, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }

    async function addUser(email: string, roles?: string[]): Promise<AddUserResponse> {
        try {
            if (!houseTeamId) {
                throw new Error("Cannot invite new users to house without being in a house")
            }
            const response = await team.createMembership({
                teamId: houseTeamId,
                roles: roles ? roles : [],
                email: email,
                url: 'https://alminim0.dynv6.net/accept-invite'
            })
            return {data: {}, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }

    async function getUsers(): Promise<GetHouseUsersResponse> {
        try {
            if (!houseTeamId) {
                throw new Error("Cannot get users in the house without being in a house")
            }
            const response = await team.listMemberships({teamId: houseTeamId})
            return {data: response, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }

    async function changeUserRoles(memberId: string, roles: string[]): Promise<ChangeUserRolesResponse> {
        try {
            if (!houseTeamId) {
                throw new Error("Cannot change a user's roles while not in a house")
            }
            const response = await team.updateMembership({
                teamId: houseTeamId,
                membershipId: memberId,
                roles: roles
            })
            return {data: {}, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }


    // TODO: Set up app linking
    // https://docs.expo.dev/linking/android-app-links/
    async function acceptHouseInvite(teamId: string, secret: string): Promise<AcceptHouseInviteResponse> {
        try {
            if (!user) {
                // TODO: allow users to join houses before creating an account
                throw new Error("Log in before accepting the house invitation")
            }
            const response = await team.updateMembershipStatus({
                teamId: teamId,
                membershipId: ID.unique(),
                userId: user.$id,
                secret: secret
            })
            setHouse(response)
            return {data: {}, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }

    async function leaveHouse(): Promise<LeaveHouseResponse> {
        try {
            if (!house || !houseTeamId) {
                throw new Error("Cannot leave house while not part of a house")
            }
            const response = await team.deleteMembership({
                teamId: houseTeamId,
                membershipId: house.$id
            })
            setHouse(null)
            setHouseTeamId(null)
            setMembers([])
            return {data: {}, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }

    async function deleteHouse(): Promise<DeleteHouseResponse> {
        try {
            if (!houseTeamId) {
                throw new Error("Cannot delete house while not part of a house")
            }
            const response = await team.delete({
                teamId: houseTeamId
            })
            setHouse(null)
            setHouseTeamId(null)
            setMembers([])
            return {data: {}, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
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
            const houses = await team.list({total: true});
            if (houses.total > 1) {
                throw new Error("User belongs to more than 1 house");
            }
            if (houses.total == 1) {
                const houseTeam = houses.teams[0]
                const houseMembers = await team.listMemberships({
                    teamId: houseTeam.$id,
                    queries: [Query.equal('userId', user.$id)]
                })
                setHouse(houseMembers.memberships[0]);
                setHouseTeamId(houseTeam.$id);
                const allMembers = await team.listMemberships({ teamId: houseTeam.$id });
                setMembers(allMembers.memberships);
            }
            else {
                setHouse(null);
                setHouseTeamId(null);
                setMembers([]);
            }
          } catch (error) {
            console.log("error", error);
            setHouse(null);
          }
          setHouseInitialized(true);
        })();
      }, [user?.$id]);

    useProtectedRoute(house)
    
    return (
        <HouseContext.Provider value={{
            createHouse: createHouse,
            addUser: addUser,
            getUsers: getUsers,
            changeUserRoles: changeUserRoles,
            acceptHouseInvite: acceptHouseInvite,
            leaveHouse: leaveHouse,
            deleteHouse: deleteHouse,
            house,
            houseTeamId,
            members,
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