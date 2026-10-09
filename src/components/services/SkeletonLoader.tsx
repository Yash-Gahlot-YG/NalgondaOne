import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Platform } from "react-native";
import { SLATE_100, SLATE_200 } from "@/constants/serviceTheme";

/* ================================================================ */
/* SKELETON LOADER — Reusable shimmer placeholder                    */
/* ================================================================ */

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonBox({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: SLATE_200,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

/* ---- Provider Card Skeleton ---- */
export function ProviderCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonBox width="100%" height={160} borderRadius={0} />
      <View style={skeletonStyles.cardBody}>
        <SkeletonBox width="75%" height={16} borderRadius={6} />
        <SkeletonBox width="40%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
        <SkeletonBox width="55%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
        <SkeletonBox width="30%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
        <SkeletonBox width="100%" height={36} borderRadius={10} style={{ marginTop: 14 }} />
      </View>
    </View>
  );
}

/* ---- Provider Details Skeleton ---- */
export function ProviderDetailsSkeleton() {
  return (
    <View>
      <SkeletonBox width="100%" height={260} borderRadius={0} />
      <View style={skeletonStyles.detailCard}>
        <SkeletonBox width="80%" height={22} borderRadius={8} />
        <SkeletonBox width="35%" height={14} borderRadius={6} style={{ marginTop: 10 }} />
        <SkeletonBox width="60%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
        <SkeletonBox width="40%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
        <SkeletonBox width="50%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
      </View>
      <View style={skeletonStyles.detailSection}>
        <SkeletonBox width="30%" height={18} borderRadius={6} />
        <SkeletonBox width="100%" height={60} borderRadius={10} style={{ marginTop: 12 }} />
      </View>
      <View style={skeletonStyles.detailSection}>
        <SkeletonBox width="25%" height={18} borderRadius={6} />
        <SkeletonBox width="100%" height={44} borderRadius={10} style={{ marginTop: 12 }} />
        <SkeletonBox width="100%" height={44} borderRadius={10} style={{ marginTop: 8 }} />
        <SkeletonBox width="100%" height={44} borderRadius={10} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/* ---- Image Skeleton ---- */
export function ImageSkeleton({ width, height }: { width: number; height: number }) {
  return <SkeletonBox width={width} height={height} borderRadius={14} />;
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SLATE_100,
    overflow: "hidden",
  },
  cardBody: {
    padding: 14,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -32,
    borderRadius: 20,
    padding: 20,
  },
  detailSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
});

export default SkeletonBox;
