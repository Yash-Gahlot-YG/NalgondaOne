import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_500,
  WHITE,
  WEB_FONT,
} from "@/constants/serviceTheme";

/* ================================================================ */
/* EMPTY STATE — Shown when no data matches the current view          */
/* ================================================================ */

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "🔍",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={s.container} accessibilityRole="text" accessibilityLabel={title}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      {description && <Text style={s.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            s.actionBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={s.actionText}>{actionLabel}</Text>
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
  actionBtn: {
    marginTop: 20,
    backgroundColor: BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "700",
    ...WEB_FONT,
  },
});
