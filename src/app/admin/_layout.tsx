import { Slot } from "expo-router";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Slot />
    </AdminAuthProvider>
  );
}
