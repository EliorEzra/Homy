import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../design-system/colors";
import { spacing } from "../design-system/spacing";

export default function Logo() {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoBox,
          {
            backgroundColor: colors.primary.DEFAULT,
          },
        ]}
      >
        <View
          style={[
            styles.innerBox,
            {
              backgroundColor: colors.neutral[100],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  innerBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});
