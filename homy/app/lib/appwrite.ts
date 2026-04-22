import { Client, TablesDB, Account } from "react-native-appwrite";

const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM_NAME as string);


export const account = new Account(client);
