import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { StatusBar } from "expo-status-bar";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FloatingBottomNavbar from "@/components/navigation/FloatingBottomNavbar";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="dark" />
          {Platform.OS === "android" && (
            <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
          )}
          <Slot />
          <FloatingBottomNavbar />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
