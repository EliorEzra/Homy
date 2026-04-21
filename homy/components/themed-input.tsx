import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'text' | 'email' | 'password';
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  type = 'text',
  ...rest
}: ThemedInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const background = useThemeColor({light: lightColor, dark: darkColor}, 'inputBackground')
  const regularBorderColor = useThemeColor({light: lightColor, dark: darkColor}, 'inputBorder')
  const selectedBorderColor = useThemeColor({light: lightColor, dark: darkColor}, 'inputBorderSelected')
  const [borderColor, setborderColor] = useState(regularBorderColor)

  return (
    <TextInput
      style={[
        { 
          color,
          backgroundColor: background,
          borderColor: borderColor
          
        },
        type === 'text' ? styles.text : undefined,
        type === 'email' ? styles.email : undefined,
        type === 'password' ? styles.password : undefined,
        style,
        {...styles.common}
      ]}
      inputMode={type === 'email' ? 'email' : 'text'}
      secureTextEntry={type === 'password' ? true : false}
      onFocus={() => setborderColor(selectedBorderColor)}
      onBlur={() => setborderColor(regularBorderColor)}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  common: {
    width: 250,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
    
  },
  text: {
    
  },
  email: {
  },
  password: {
  },
});