import { useCallback, useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import { router } from "expo-router";

/**
 * Custom hook to safely handle Back navigation across Web and Android.
 *
 * Rules:
 * 1. If previous history exists within the app (router.canGoBack() === true),
 *    pops the current screen via router.back().
 * 2. If no history exists (e.g. direct link, page refresh, external entry),
 *    safely replaces the current route with fallbackRoute via router.replace().
 * 3. Never uses router.push(fallbackRoute) on back navigation to avoid corrupting
 *    the browser/device history with redundant forward entries.
 * 4. On Android devices, intercepts the hardware back button (hardwareBackPress)
 *    so the user is taken to the parent screen rather than abruptly exiting the app.
 */
export function useSafeBack(fallbackRoute: string) {
  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  }, [fallbackRoute]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      goBack();
      return true; // Prevents default hardware back behavior (e.g. exiting the app)
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [goBack]);

  return goBack;
}
