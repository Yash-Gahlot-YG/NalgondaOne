import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_500,
  WHITE,
  WEB_FONT,
} from "@/constants/serviceTheme";

/* ================================================================ */
/* ERROR STATE — Shown when data loading fails or route is invalid    */
/* ================================================================ */

interface ErrorStateProps {
  icon?: string;
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  icon = "⚠️",
  title,
  description,
  retryLabel = "Try Again",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={s.container} accessibilityRole="alert" accessibilityLabel={title}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      {description && <Text style={s.description}>{description}</Text>}
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            s.retryBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          <Text style={s.retryText}>{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: SLATE_900,
    textAlign: "center",
    ...WEB_FONT,
  },
  description: {
    fontSize: 14,
    color: SLATE_500,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
    ...WEB_FONT,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "700",
    ...WEB_FONT,
  },
});
