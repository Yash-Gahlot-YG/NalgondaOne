import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import {
  BRAND,
  WHITE,
  SUCCESS,
  SLATE_400,
  WEB_FONT,
} from "@/constants/serviceTheme";

interface ProviderActionButtonsProps {
  onCall: () => void;
  onWhatsApp: () => void;
  isMock?: boolean;  // When true, buttons show as disabled demo
}

export default function ProviderActionButtons({
  onCall,
  onWhatsApp,
  isMock = false,
}: ProviderActionButtonsProps) {
  return (
    <View style={s.container}>
      <Pressable
        onPress={isMock ? undefined : onCall}
        style={({ pressed }) => [
          s.btn,
          isMock ? s.callBtnDisabled : s.callBtn,
          { opacity: pressed && !isMock ? 0.85 : 1 },
        ]}
        disabled={isMock}
        accessibilityRole="button"
        accessibilityLabel={isMock ? "Call — demo only, not available" : "Call this provider"}
        accessibilityState={{ disabled: isMock }}
      >
        <Text style={s.btnIcon}>📞</Text>
        <Text style={[s.btnText, isMock ? s.btnTextDisabled : { color: BRAND }]}>
          {isMock ? "Call (Demo)" : "Call Now"}
        </Text>
      </Pressable>

      <Pressable
        onPress={isMock ? undefined : onWhatsApp}
        style={({ pressed }) => [
          s.btn,
          isMock ? s.whatsappBtnDisabled : s.whatsappBtn,
          { opacity: pressed && !isMock ? 0.85 : 1 },
        ]}
        disabled={isMock}
        accessibilityRole="button"
        accessibilityLabel={isMock ? "WhatsApp — demo only, not available" : "Message on WhatsApp"}
        accessibilityState={{ disabled: isMock }}
      >
        <Text style={s.btnIcon}>💬</Text>
        <Text style={[s.btnText, { color: isMock ? SLATE_400 : WHITE }]}>
          {isMock ? "WhatsApp (Demo)" : "WhatsApp"}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    ...(Platform.OS === "web"
      ? {
          position: "sticky" as any,
          bottom: 0,
          zIndex: 50,
          boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
        }
      : {}),
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  callBtn: {
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BRAND,
  },
  callBtnDisabled: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  whatsappBtn: {
    backgroundColor: SUCCESS,
  },
  whatsappBtnDisabled: {
    backgroundColor: "#E2E8F0",
  },
  btnIcon: {
    fontSize: 18,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },
  btnTextDisabled: {
    color: SLATE_400,
  },
});
