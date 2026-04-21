import { TextStyle } from "react-native";

export const typography = {
  heading: {
    1: {
      fontSize: 32,
      fontWeight: "700",
      lineHeight: 40,
    } as TextStyle,
    2: {
      fontSize: 28,
      fontWeight: "700",
      lineHeight: 36,
    } as TextStyle,
    3: {
      fontSize: 24,
      fontWeight: "700",
      lineHeight: 32,
    } as TextStyle,
  },
  body: {
    lg: {
      fontSize: 18,
      fontWeight: "400",
      lineHeight: 28,
    } as TextStyle,
    md: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
    } as TextStyle,
    sm: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 20,
    } as TextStyle,
  },
  label: {
    lg: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 24,
    } as TextStyle,
    md: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    } as TextStyle,
    sm: {
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 18,
    } as TextStyle,
  },
};
