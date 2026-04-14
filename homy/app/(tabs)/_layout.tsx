import { Stack } from "expo-router";
import { Provider } from "../context/auth";

export default function RootLayout() {
  return <Provider><Stack /></Provider>;
}
