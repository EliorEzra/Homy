import { Models } from "react-native-appwrite"

export interface joinHouseResponse {
    success: boolean,
    error?: string
}

export type EnrichedMember = (Models.Membership & {
    userName: string,
    userEmail: string,
    avatarColor?: string,
    avatarIcon?: string
})

export interface getMembersResponse {
    success: boolean,
    members: EnrichedMember[]
}