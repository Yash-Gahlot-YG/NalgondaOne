import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
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
  isMobileWidth,
} from "@/constants/serviceTheme";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  fetchBusinessStats,
  fetchAllBusinesses,
  deleteBusiness,
  type AdminBusiness,
  type BusinessStats,
} from "@/services/adminApi";

const DANGER = "#EF4444";
type StatusFilter = "pending" | "approved" | "changes_requested" | "rejected" | "all";

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();

  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [selectedTab, setSelectedTab] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async (tab: StatusFilter = selectedTab) => {
    try {
      setError(null);
      const [statsData, listData] = await Promise.all([
        fetchBusinessStats(),
        fetchAllBusinesses(tab === "all" ? undefined : tab),
      ]);
      setStats(statsData);
      setBusinesses(listData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data."
      );
    }
  }, [selectedTab]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      loadData(selectedTab).finally(() => setLoading(false));
    }
  }, [isAuthenticated, selectedTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(selectedTab);
    setRefreshing(false);
  };

  const handleTabChange = (tab: StatusFilter) => {
    setSelectedTab(tab);
    setSuccessMessage(null);
  };

  const confirmDelete = (biz: AdminBusiness) => {
    const msg = `Are you sure you want to permanently delete "${biz.businessName}"? This action cannot be undone and will immediately remove it from public listings and search results.`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) {
        handleDelete(biz);
      }
    } else {
      Alert.alert("Confirm Deletion", msg, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(biz),
        },
      ]);
    }
  };

  const handleDelete = async (biz: AdminBusiness) => {
    setDeletingId(biz._id);
    setError(null);
    try {
      await deleteBusiness(biz._id);
      setSuccessMessage(`"${biz.businessName}" was deleted successfully.`);
      await loadData(selectedTab);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete business."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Auth guard
  if (authLoading) {
    return (
      <View style={[s.page, s.center]}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    setTimeout(() => router.replace("/admin/login" as any), 0);
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login" as any);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending", text: "#92400E", bg: "#FEF3C7", dot: "#D97706" };
      case "approved":
        return { label: "Approved", text: "#065F46", bg: "#ECFDF5", dot: "#059669" };
      case "changes_requested":
        return { label: "Changes Requested", text: "#1E40AF", bg: "#EFF6FF", dot: "#2563EB" };
      case "rejected":
        return { label: "Rejected", text: "#991B1B", bg: "#FEF2F2", dot: "#DC2626" };
      default:
        return { label: status, text: SLATE_700, bg: SLATE_100, dot: SLATE_400 };
    }
  };

  const statCards: {
    key: StatusFilter;
    label: string;
    value: number;
    color: string;
    bg: string;
  }[] = stats
    ? [
        {
          key: "pending",
          label: "Pending",
          value: stats.pending,
          color: "#D97706",
          bg: "#FEF3C7",
        },
        {
          key: "approved",
          label: "Approved",
          value: stats.approved,
          color: "#059669",
          bg: "#ECFDF5",
        },
        {
          key: "changes_requested",
          label: "Changes Requested",
          value: stats.changesRequested,
          color: "#2563EB",
          bg: "#EFF6FF",
        },
        {
          key: "rejected",
          label: "Rejected",
          value: stats.rejected,
          color: "#DC2626",
          bg: "#FEF2F2",
        },
      ]
    : [];

  const tabOptions: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "pending", label: "Pending", count: stats?.pending },
    { key: "approved", label: "Approved", count: stats?.approved },
    { key: "changes_requested", label: "Changes Requested", count: stats?.changesRequested },
    { key: "rejected", label: "Rejected", count: stats?.rejected },
    { key: "all", label: "All Businesses", count: stats?.total },
  ];

  return (
    <View style={s.page}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <View style={s.topBarInner}>
          <View>
            <Text style={s.topBarTitle}>NalgondaOne Admin</Text>
            <Text style={s.topBarSubtitle}>
              {user?.name} • {user?.role === "super_admin" ? "Super Admin" : "Admin"}
            </Text>
          </View>
          <View style={s.topBarActions}>
            <Pressable
              onPress={() => router.push("/" as any)}
              style={s.topBarLink}
            >
              <Text style={s.topBarLinkText}>View Site</Text>
            </Pressable>
            <Pressable onPress={handleLogout} style={s.logoutBtn}>
              <Text style={s.logoutBtnText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingHorizontal: isMobile ? 16 : 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={s.container}>
          {/* Page Header */}
          <View style={s.pageHeader}>
            <Text style={s.pageTitle}>Dashboard</Text>
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

          {/* Error Banner */}
          {error && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>⚠️ {error}</Text>
              <Pressable onPress={onRefresh}>
                <Text style={s.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {/* Success Banner */}
          {successMessage && (
            <View style={s.successBanner}>
              <Text style={s.successText}>✅ {successMessage}</Text>
              <Pressable onPress={() => setSuccessMessage(null)}>
                <Text style={s.dismissText}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View style={[s.center, { paddingVertical: 60 }]}>
              <ActivityIndicator color={BRAND} size="large" />
              <Text style={s.loadingText}>Loading dashboard...</Text>
            </View>
          )}

          {!loading && (
            <>
              {/* Stat Cards (Clickable Filter Buttons) */}
              <View
                style={[
                  s.statsGrid,
                  isMobile && { flexDirection: "column" },
                ]}
              >
                {statCards.map((card) => {
                  const isActive = selectedTab === card.key;
                  return (
                    <Pressable
                      key={card.key}
                      onPress={() => handleTabChange(card.key)}
                      style={({ pressed }) => [
                        s.statCard,
                        { backgroundColor: card.bg },
                        isActive && s.statCardActive,
                        !isMobile && { flex: 1 },
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <Text style={[s.statValue, { color: card.color }]}>
                        {card.value}
                      </Text>
                      <Text style={[s.statLabel, { color: card.color }]}>
                        {card.label}
                      </Text>
                      {isActive && (
                        <View
                          style={[s.activeIndicator, { backgroundColor: card.color }]}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Status Filter Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.tabsContainer}
                style={s.tabsScroll}
              >
                {tabOptions.map((tab) => {
                  const isActive = selectedTab === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => handleTabChange(tab.key)}
                      style={[
                        s.filterTab,
                        isActive && s.filterTabActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.filterTabText,
                          isActive && s.filterTabTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                      {typeof tab.count === "number" && (
                        <View
                          style={[
                            s.tabBadge,
                            isActive && s.tabBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              s.tabBadgeText,
                              isActive && s.tabBadgeTextActive,
                            ]}
                          >
                            {tab.count}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Section Header */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>
                  {tabOptions.find((t) => t.key === selectedTab)?.label} (
                  {businesses.length})
                </Text>
              </View>

              {businesses.length === 0 ? (
                <View style={s.emptyState}>
                  <Text style={s.emptyIcon}>📂</Text>
                  <Text style={s.emptyTitle}>No businesses found</Text>
                  <Text style={s.emptySubtitle}>
                    {selectedTab === "pending"
                      ? "No businesses currently awaiting verification."
                      : `No businesses with status "${selectedTab}".`}
                  </Text>
                </View>
              ) : (
                <View style={s.businessList}>
                  {businesses.map((biz) => {
                    const sc = statusConfig(biz.status);
                    const isDeleting = deletingId === biz._id;

                    return (
                      <View key={biz._id} style={s.businessCard}>
                        <View style={s.bizCardTop}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={s.bizName}>{biz.businessName}</Text>
                            <Text style={s.bizCategory}>{biz.category}</Text>
                          </View>
                          <View
                            style={[
                              s.statusPill,
                              { backgroundColor: sc.bg },
                            ]}
                          >
                            <View
                              style={[
                                s.statusDot,
                                { backgroundColor: sc.dot },
                              ]}
                            />
                            <Text
                              style={[
                                s.statusPillText,
                                { color: sc.text },
                              ]}
                            >
                              {sc.label}
                            </Text>
                            {biz.verified && (
                              <Text style={s.verifiedTag}>✓</Text>
                            )}
                          </View>
                        </View>

                        <View style={s.bizDetails}>
                          <Text style={s.bizDetailText}>
                            📍 {biz.locality}, {biz.city}
                          </Text>
                          <Text style={s.bizDetailText}>📞 {biz.phone}</Text>
                          <Text style={s.bizDetailText}>
                            📅 Submitted: {formatDate(biz.createdAt)}
                          </Text>
                          {biz.verifiedAt && (
                            <Text style={s.bizDetailText}>
                              ✅ Verified: {formatDate(biz.verifiedAt)}
                            </Text>
                          )}
                        </View>

                        <View style={s.cardActionsRow}>
                          {/* Delete Button - Prominently available for approved & all businesses */}
                          <Pressable
                            onPress={() => confirmDelete(biz)}
                            disabled={isDeleting}
                            style={({ pressed }) => [
                              s.deleteBtn,
                              { opacity: pressed || isDeleting ? 0.7 : 1 },
                            ]}
                          >
                            {isDeleting ? (
                              <ActivityIndicator color={DANGER} size="small" />
                            ) : (
                              <Text style={s.deleteBtnText}>🗑️ Delete</Text>
                            )}
                          </Pressable>

                          <Pressable
                            onPress={() =>
                              router.push(`/admin/business/${biz._id}` as any)
                            }
                            style={({ pressed }) => [
                              s.viewDetailsBtn,
                              { opacity: pressed ? 0.85 : 1 },
                            ]}
                          >
                            <Text style={s.viewDetailsBtnText}>
                              View Details →
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
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

  /* Top Bar */
  topBar: {
    backgroundColor: SLATE_900,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }
      : {}),
  },
  topBarInner: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarTitle: {
    color: WHITE,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    ...WEB_FONT,
  },
  topBarSubtitle: {
    color: SLATE_400,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    ...WEB_FONT,
  },
  topBarActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  topBarLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  topBarLinkText: {
    color: SLATE_300,
    fontSize: 12,
    fontWeight: "700",
    ...WEB_FONT,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  logoutBtnText: {
    color: "#FCA5A5",
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
    maxWidth: 1100,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  refreshBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  refreshBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_700,
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
  successBanner: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  successText: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
    ...WEB_FONT,
  },
  dismissText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "800",
    paddingHorizontal: 8,
  },
  loadingText: {
    color: SLATE_500,
    fontSize: 13,
    marginTop: 12,
    ...WEB_FONT,
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.06)",
    position: "relative",
    overflow: "hidden",
  },
  statCardActive: {
    borderColor: SLATE_900,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }
      : {}),
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    ...WEB_FONT,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    ...WEB_FONT,
  },

  /* Tabs */
  tabsScroll: {
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  filterTabActive: {
    backgroundColor: SLATE_900,
    borderColor: SLATE_900,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  filterTabTextActive: {
    color: WHITE,
  },
  tabBadge: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: SLATE_700,
  },
  tabBadgeTextActive: {
    color: WHITE,
  },

  /* Section */
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },

  /* Empty */
  emptyState: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  emptyIcon: {
    fontSize: 36,
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
    marginTop: 4,
    ...WEB_FONT,
  },

  /* Business List */
  businessList: {
    gap: 12,
    paddingBottom: 40,
  },
  businessCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }
      : {}),
  },
  bizCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bizName: {
    fontSize: 16,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },
  bizCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
    marginTop: 2,
    ...WEB_FONT,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: "900",
    color: "#059669",
    marginLeft: 2,
  },
  bizDetails: {
    gap: 4,
    marginBottom: 14,
  },
  bizDetailText: {
    fontSize: 12,
    color: SLATE_500,
    fontWeight: "600",
    ...WEB_FONT,
  },
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  deleteBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },
  viewDetailsBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  viewDetailsBtnText: {
    color: BRAND,
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },
});
