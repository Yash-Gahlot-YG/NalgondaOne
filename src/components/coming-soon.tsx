import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ComingSoonScreen({ title = "Coming Soon" }: { title?: string }) {
  return (
    <View style={s.container}>
      <Text style={s.emoji}>🚧</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.sub}>This section is under development.</Text>
      <Pressable style={s.btn} onPress={() => router.push("/")}>
        <Text style={s.btnText}>← Back to Home</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "900", color: "#0F172A", textAlign: "center" },
  sub: { fontSize: 16, color: "#64748B", marginTop: 8, textAlign: "center" },
  btn: {
    marginTop: 24,
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
