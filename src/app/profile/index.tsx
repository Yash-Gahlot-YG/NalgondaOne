import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import {
  BRAND,
  BRAND_DARK,
  SLATE_900,
  SLATE_800,
  SLATE_700,
  SLATE_500,
  SLATE_400,
  SLATE_300,
  SLATE_200,
  SLATE_100,
  SLATE_50,
  WHITE,
  SUCCESS,
  WARNING,
  WEB_FONT,
  CONTENT_MAX_WIDTH,
  isMobileWidth,
} from "@/constants/serviceTheme";
import { useAuth } from "@/context/AuthContext";
import { fetchMyBusinesses, type BusinessDocument } from "@/services/businessApi";
import { isRemoteImageUrl } from "@/utils/imageUtils";

export default function ProfileDashboardScreen() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [businesses, setBusinesses] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const list = await fetchMyBusinesses();
      setBusinesses(list);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your businesses. Please try again."
      );
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }
  }, [isAuthenticated, loadData]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/profile" as any);
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <View style={[s.page, s.center]}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/" as any);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string, verified: boolean) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved & Live",
          bg: "#ECFDF5",
          text: "#065F46",
          dot: "#059669",
          icon: "✅",
        };
      case "changes_requested":
        return {
          label: "Changes Requested",
          bg: "#EFF6FF",
          text: "#1E40AF",
          dot: "#2563EB",
          icon: "⚠️",
        };
      case "rejected":
        return {
          label: "Rejected",
          bg: "#FEF2F2",
          text: "#991B1B",
          dot: "#DC2626",
          icon: "❌",
        };
      case "pending":
      default:
        return {
          label: "Pending Verification",
          bg: "#FEF3C7",
          text: "#92400E",
          dot: "#D97706",
          icon: "⏳",
        };
    }
  };

  const userRoleLabel =
    user?.role === "super_admin"
      ? "Super Admin"
      : user?.role === "admin"
      ? "Admin"
      : user?.role === "business_owner"
      ? "Business Owner"
      : "Community Member";

  return (
    <View style={s.page}>
      {/* Top Navigation */}
      <View style={s.navbar}>
        <View style={s.navbarInner}>
          <Pressable onPress={() => router.push("/")} style={s.logoWrap}>
            <Text style={s.logoText}>
              Nalgonda<Text style={s.logoAccent}>One</Text>
            </Text>
            <Text style={s.portalBadge}>Owner Dashboard</Text>
          </Pressable>

          <View style={s.navActions}>
            <Pressable
              onPress={() => router.push("/" as any)}
              style={s.navLink}
            >
              <Text style={s.navLinkText}>Explore</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/services" as any)}
              style={s.navLink}
            >
              <Text style={s.navLinkText}>Services</Text>
            </Pressable>
            <Pressable onPress={handleLogout} style={s.signOutBtn}>
              <Text style={s.signOutBtnText}>Sign Out</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingHorizontal: isMobile ? 16 : 28 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={s.container}>
          {/* User Profile Card */}
          <View style={s.profileCard}>
            <View style={s.profileHeader}>
              <View style={s.avatarCircle}>
                <Text style={s.avatarText}>
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "U"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={s.nameRoleRow}>
                  <Text style={s.userName}>{user?.name}</Text>
                  <View style={s.rolePill}>
                    <Text style={s.rolePillText}>{userRoleLabel}</Text>
                  </View>
                </View>

                <Text style={s.userEmail}>✉️ {user?.email}</Text>
                {user?.phone ? (
                  <Text style={s.userPhone}>📞 {user.phone}</Text>
                ) : null}
                {user?.createdAt ? (
                  <Text style={s.userJoined}>
                    Member since {formatDate(user.createdAt)}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Quick Actions Bar */}
            <View style={s.profileActionsBar}>
              <Pressable
                onPress={() => router.push("/add-business" as any)}
                style={({ pressed }) => [
                  s.addBizBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={s.addBizBtnText}>+ Register New Business</Text>
              </Pressable>

              <Pressable
                onPress={onRefresh}
                style={({ pressed }) => [
                  s.refreshBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={s.refreshBtnText}>🔄 Refresh</Text>
              </Pressable>
            </View>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>⚠️ {error}</Text>
              <Pressable onPress={onRefresh}>
                <Text style={s.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {/* Section Title */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              My Businesses ({businesses.length})
            </Text>
            <Text style={s.sectionSubtitle}>
              Manage and track the verification status of your local businesses.
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={[s.center, { paddingVertical: 50 }]}>
              <ActivityIndicator color={BRAND} size="large" />
              <Text style={s.loadingText}>Loading your businesses...</Text>
            </View>
          )}

          {/* Business List / Empty State */}
          {!loading && businesses.length === 0 && (
            <View style={s.emptyCard}>
              <Text style={s.emptyIcon}>🏢</Text>
              <Text style={s.emptyTitle}>No Businesses Registered Yet</Text>
              <Text style={s.emptySubtitle}>
                Get your business listed on NalgondaOne to connect with local customers across Nalgonda.
              </Text>
              <Pressable
                onPress={() => router.push("/add-business" as any)}
                style={s.emptyCtaBtn}
              >
                <Text style={s.emptyCtaText}>+ Register Your Business Now</Text>
              </Pressable>
            </View>
          )}

          {!loading && businesses.length > 0 && (
            <View style={s.businessList}>
              {businesses.map((biz) => {
                const sb = getStatusBadge(biz.status, biz.verified);
                const coverImage = isRemoteImageUrl(biz.coverPhoto)
                  ? biz.coverPhoto
                  : isRemoteImageUrl(biz.logo)
                  ? biz.logo
                  : null;

                return (
                  <View key={biz._id} style={s.businessCard}>
                    {/* Top Row: Info & Status */}
                    <View style={s.bizCardHeader}>
                      {coverImage ? (
                        <ExpoImage
                          source={{ uri: coverImage }}
                          style={s.bizThumb}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={s.bizThumbPlaceholder}>
                          <Text style={s.bizThumbPlaceholderText}>
                            {biz.businessName?.[0] || "B"}
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1, paddingLeft: 14 }}>
                        <Text style={s.bizName}>{biz.businessName}</Text>
                        <Text style={s.bizCategory}>{biz.category}</Text>
                        <Text style={s.bizLocation}>
                          📍 {biz.locality}, {biz.city}
                        </Text>
                      </View>
                    </View>

                    {/* Status Pill */}
                    <View
                      style={[
                        s.statusBanner,
                        { backgroundColor: sb.bg },
                      ]}
                    >
                      <View style={s.statusBannerLeft}>
                        <View
                          style={[s.statusDot, { backgroundColor: sb.dot }]}
                        />
                        <Text
                          style={[s.statusBannerText, { color: sb.text }]}
                        >
                          {sb.icon} {sb.label}
                        </Text>
                      </View>

                      {biz.verified && (
                        <View style={s.verifiedTag}>
                          <Text style={s.verifiedTagText}>✓ Verified</Text>
                        </View>
                      )}
                    </View>

                    {/* Notice box if changes requested */}
                    {biz.status === "changes_requested" && biz.adminNotes ? (
                      <View style={s.noticeBox}>
                        <Text style={s.noticeTitle}>
                          ⚠️ Changes Requested by Admin:
                        </Text>
                        <Text style={s.noticeBody}>{biz.adminNotes}</Text>
                        <Text style={s.noticeHint}>
                          Please edit your business details below to address the requested changes.
                        </Text>
                      </View>
                    ) : null}

                    {/* Notice box if rejected */}
                    {biz.status === "rejected" && biz.rejectionReason ? (
                      <View style={[s.noticeBox, s.noticeBoxDanger]}>
                        <Text style={[s.noticeTitle, { color: "#991B1B" }]}>
                          ❌ Reason for Rejection:
                        </Text>
                        <Text style={[s.noticeBody, { color: "#991B1B" }]}>
                          {biz.rejectionReason}
                        </Text>
                      </View>
                    ) : null}

                    {/* Details Row */}
                    <View style={s.bizMetaRow}>
                      <Text style={s.bizMetaText}>📞 {biz.phone}</Text>
                      <Text style={s.bizMetaText}>
                        🕒 {biz.is24Hours ? "Open 24/7" : `${biz.openingTime} – ${biz.closingTime}`}
                      </Text>
                      <Text style={s.bizMetaText}>
                        📅 Submitted: {formatDate(biz.createdAt)}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={s.cardActionsRow}>
                      <Pressable
                        onPress={() =>
                          router.push(`/profile/edit-business/${biz._id}` as any)
                        }
                        style={({ pressed }) => [
                          s.editBtn,
                          { opacity: pressed ? 0.85 : 1 },
                        ]}
                      >
                        <Text style={s.editBtnText}>✏️ Edit Business</Text>
                      </Pressable>

                      {biz.status === "approved" ? (
                        <Pressable
                          onPress={() => router.push(`/places/${biz._id}` as any)}
                          style={({ pressed }) => [
                            s.viewListingBtn,
                            { opacity: pressed ? 0.85 : 1 },
                          ]}
                        >
                          <Text style={s.viewListingBtnText}>
                            👁️ View Public Listing
                          </Text>
                        </Pressable>
                      ) : (
                        <View style={s.statusInfoPill}>
                          <Text style={s.statusInfoPillText}>
                            {biz.status === "pending"
                              ? "Awaiting review by admin"
                              : "Update to resubmit"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: SLATE_50,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  /* Navbar */
  navbar: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }
      : {}),
  },
  navbarInner: {
    maxWidth: CONTENT_MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  logoAccent: {
    color: BRAND,
  },
  portalBadge: {
    backgroundColor: "#EFF6FF",
    color: BRAND,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    ...WEB_FONT,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navLink: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  navLinkText: {
    color: SLATE_700,
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  signOutBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* Content */
  scrollContent: {
    paddingVertical: 24,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 18px rgba(0,0,0,0.04)" }
      : {}),
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "900",
    ...WEB_FONT,
  },
  nameRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.3,
    ...WEB_FONT,
  },
  rolePill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  rolePillText: {
    color: BRAND,
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },
  userEmail: {
    fontSize: 13,
    color: SLATE_500,
    fontWeight: "600",
    ...WEB_FONT,
  },
  userPhone: {
    fontSize: 13,
    color: SLATE_500,
    fontWeight: "600",
    marginTop: 2,
    ...WEB_FONT,
  },
  userJoined: {
    fontSize: 11,
    color: SLATE_400,
    marginTop: 4,
    ...WEB_FONT,
  },
  profileActionsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
    gap: 12,
    flexWrap: "wrap",
  },
  addBizBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBizBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
  refreshBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  refreshBtnText: {
    color: SLATE_700,
    fontSize: 12,
    fontWeight: "700",
    ...WEB_FONT,
  },

  /* Banners */
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    ...WEB_FONT,
  },
  retryText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 12,
    ...WEB_FONT,
  },
  loadingText: {
    color: SLATE_500,
    fontSize: 13,
    marginTop: 12,
    ...WEB_FONT,
  },

  /* Section */
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.3,
    ...WEB_FONT,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 3,
    ...WEB_FONT,
  },

  /* Empty State */
  emptyCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },
  emptySubtitle: {
    fontSize: 13,
    color: SLATE_500,
    textAlign: "center",
    maxWidth: 420,
    marginTop: 6,
    lineHeight: 20,
    ...WEB_FONT,
  },
  emptyCtaBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyCtaText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* Business List */
  businessList: {
    gap: 16,
    paddingBottom: 40,
  },
  businessCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }
      : {}),
  },
  bizCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  bizThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SLATE_100,
  },
  bizThumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
  },
  bizThumbPlaceholderText: {
    color: WHITE,
    fontSize: 24,
    fontWeight: "900",
  },
  bizName: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.2,
    ...WEB_FONT,
  },
  bizCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
    marginTop: 2,
    ...WEB_FONT,
  },
  bizLocation: {
    fontSize: 12,
    color: SLATE_500,
    marginTop: 3,
    fontWeight: "600",
    ...WEB_FONT,
  },

  /* Status Banner */
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  statusBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },
  verifiedTag: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedTagText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* Notice Box */
  noticeBox: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  noticeBoxDanger: {
    backgroundColor: "#FEF2F2",
    borderLeftColor: "#DC2626",
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E40AF",
    marginBottom: 4,
    ...WEB_FONT,
  },
  noticeBody: {
    fontSize: 12,
    color: SLATE_800,
    lineHeight: 18,
    ...WEB_FONT,
  },
  noticeHint: {
    fontSize: 11,
    color: SLATE_500,
    marginTop: 4,
    fontStyle: "italic",
    ...WEB_FONT,
  },

  /* Meta Row */
  bizMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
  },
  bizMetaText: {
    fontSize: 12,
    color: SLATE_500,
    fontWeight: "600",
    ...WEB_FONT,
  },

  /* Action Buttons */
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
    gap: 10,
  },
  editBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
  viewListingBtn: {
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewListingBtnText: {
    color: SLATE_700,
    fontSize: 12,
    fontWeight: "700",
    ...WEB_FONT,
  },
  statusInfoPill: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusInfoPillText: {
    color: SLATE_500,
    fontSize: 11,
    fontWeight: "600",
    ...WEB_FONT,
  },
});
