import React, { useContext, useEffect, useState } from "react";
import { team } from "@/lib/appwrite";
import { Models, ID, Query } from "react-native-appwrite";
import { useAuth } from "./auth";

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
}

interface ProviderProps {
  children: React.ReactNode;
}

const HouseContext = React.createContext<HouseContextValue | undefined>(
  undefined
);

export function HouseProvider(props: ProviderProps) {
    const [house, setHouse] = useState<Models.Membership | null>(null);
    const {user} = useAuth()
    if (!user) {
        // TODO: allow users to join houses before creating an account
        throw new Error("Log in before accepting the house invitation")
    }

    async function createHouse(name: string, roles?: string[]): Promise<CreateHouseResponse> {
        try {
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
                queries: [Query.equal('userId', user!.$id)],
                total: true
            })
            if (memberships.total != 1) {
                throw new Error("Created team but user is not part of it")
            }
            setHouse(memberships.memberships[0])
            return {data: response, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }


    // TODO: check this when we have SMTP (mail) set up
    async function addUser(email: string, roles?: string[]): Promise<AddUserResponse> {
        try {
            if (!house) {
                throw new Error("Cannot invite new users to house without being in a house")
            }
            const response = await team.createMembership({
                teamId: house.teamId,
                roles: roles ? roles : [],
                email: email
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
            if (!house) {
                throw new Error("Cannot get users in the house without being in a house")
            }
            const response = await team.listMemberships({teamId: house.teamId})
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
            if (!house) {
                throw new Error("Cannot change a user's roles while not in a house")
            }
            const response = await team.updateMembership({
                teamId: house.teamId,
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

    async function acceptHouseInvite(teamId: string, secret: string): Promise<AcceptHouseInviteResponse> {
        try {
            const response = await team.updateMembershipStatus({
                teamId: teamId,
                membershipId: ID.unique(),
                userId: user!.$id,
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
            if (!house) {
                throw new Error("Cannot leave house while not part of a house")
            }
            const response = await team.deleteMembership({
                teamId: house.teamId,
                membershipId: house.$id
            })
            setHouse(null)
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
            if (!house) {
                throw new Error("Cannot delete house while not part of a house")
            }
            const response = await team.delete({
                teamId: house.teamId
            })
            return {data: {}, error: undefined}
        } catch (error) {
            return {
                data: undefined,
                error: error as Error
            }
        }
    }

    useEffect(() => {
        (async () => {
          try {
            const houses = await team.list({total: true});
            if (houses.total > 1) {
                throw new Error("User belongs to more than 1 house");
            }
            console.log(houses);
            if (houses.total == 1) {
                const house = houses.teams[0]
                const houseMembers = await team.listMemberships({
                    teamId: house.$id,
                    queries: [Query.equal('userId', user!.$id)]
                })
                setHouse(houseMembers.memberships[0]);
            }
            else {
                setHouse(null);
            }
          } catch (error) {
            console.log("error", error);
            setHouse(null);
          }
          console.log("initialize ", house);
        })();
      }, []);

    return (
        <HouseContext.Provider value={{
            createHouse: createHouse,
            addUser: addUser,
            getUsers: getUsers,
            changeUserRoles: changeUserRoles,
            acceptHouseInvite: acceptHouseInvite,
            leaveHouse: leaveHouse,
            deleteHouse: deleteHouse,
            house
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