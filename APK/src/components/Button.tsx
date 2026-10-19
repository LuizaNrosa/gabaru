import { Pressable, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../theme";
export function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[s.text, secondary && { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 6,
    backgroundColor: colors.ink,
    justifyContent: "center",
    marginVertical: 5,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: colors.white,
  },
});
