import React, { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import {
  BRAND,
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
  fetchBusinessById,
  approveBusiness,
  requestBusinessChanges,
  rejectBusiness,
  deleteBusiness,
  type AdminBusiness,
} from "@/services/adminApi";
import { isRemoteImageUrl } from "@/utils/imageUtils";

const DANGER = "#EF4444";

type ActionMode = null | "approve" | "changes" | "reject" | "delete";

export default function BusinessReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const [business, setBusiness] = useState<AdminBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action state
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await fetchBusinessById(id);
      setBusiness(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load business details."
      );
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      setLoading(true);
      loadBusiness().finally(() => setLoading(false));
    }
  }, [isAuthenticated, id, loadBusiness]);

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

  const confirmAction = (action: ActionMode) => {
    if (action === "approve") {
      const msg = `Approve "${business?.businessName}"? This will make it publicly visible with a Verified badge.`;
      if (Platform.OS === "web") {
        if (window.confirm(msg)) handleAction("approve");
      } else {
        Alert.alert("Confirm Approval", msg, [
          { text: "Cancel", style: "cancel" },
          { text: "Approve", onPress: () => handleAction("approve") },
        ]);
      }
    } else if (action === "delete") {
      const msg = `Are you sure you want to permanently delete "${business?.businessName}"? This action cannot be undone and will immediately remove the business from public listings, categories, and search results.`;
      if (Platform.OS === "web") {
        if (window.confirm(msg)) handleAction("delete");
      } else {
        Alert.alert("Confirm Deletion", msg, [
          { text: "Cancel", style: "cancel" },
          { text: "Delete Permanently", style: "destructive", onPress: () => handleAction("delete") },
        ]);
      }
    } else {
      // For changes/reject, show input mode
      setActionMode(action);
      setReason("");
      setActionError(null);
      setActionSuccess(null);
    }
  };

  const handleAction = async (action: ActionMode) => {
    if (!business || !id) return;

    if ((action === "changes" || action === "reject") && !reason.trim()) {
      setActionError("Please provide a reason.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      if (action === "approve") {
        await approveBusiness(id);
        setActionSuccess("Business approved successfully! ✅");
        await loadBusiness();
        setActionMode(null);
        setReason("");
      } else if (action === "changes") {
        await requestBusinessChanges(id, reason.trim());
        setActionSuccess("Changes requested successfully.");
        await loadBusiness();
        setActionMode(null);
        setReason("");
      } else if (action === "reject") {
        await rejectBusiness(id, reason.trim());
        setActionSuccess("Business rejected.");
        await loadBusiness();
        setActionMode(null);
        setReason("");
      } else if (action === "delete") {
        await deleteBusiness(id);
        setActionSuccess("Business deleted successfully. Redirecting to dashboard...");
        setTimeout(() => {
          router.replace("/admin" as any);
        }, 1200);
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Action failed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "#92400E", bg: "#FEF3C7", dot: "#D97706" };
      case "approved":
        return { text: "#065F46", bg: "#ECFDF5", dot: "#059669" };
      case "changes_requested":
        return { text: "#1E40AF", bg: "#EFF6FF", dot: "#2563EB" };
      case "rejected":
        return { text: "#991B1B", bg: "#FEF2F2", dot: "#DC2626" };
      default:
        return { text: SLATE_700, bg: SLATE_100, dot: SLATE_400 };
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Verification";
      case "approved":
        return "Approved";
      case "changes_requested":
        return "Changes Requested";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hoursDisplay = business?.is24Hours
    ? "Open 24 Hours"
    : `${business?.openingTime || "—"} – ${business?.closingTime || "—"}`;

  const closedDaysDisplay =
    business?.closedDays && business.closedDays.length > 0
      ? business.closedDays.join(", ")
      : "Open all days";

  const sc = business ? statusColor(business.status) : statusColor("");

  return (
    <View style={s.page}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <View style={s.topBarInner}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnText}>← Back to Dashboard</Text>
          </Pressable>
          <Text style={s.topBarTitle}>Business Review</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingHorizontal: isMobile ? 16 : 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.container}>
          {/* Loading */}
          {loading && (
            <View style={[s.center, { paddingVertical: 60 }]}>
              <ActivityIndicator color={BRAND} size="large" />
              <Text style={s.loadingText}>Loading business details...</Text>
            </View>
          )}

          {/* Error */}
          {error && !loading && (
            <View style={s.errorBanner}>
              <Text style={s.errorTextBanner}>⚠️ {error}</Text>
              <Pressable onPress={() => { setLoading(true); loadBusiness().finally(() => setLoading(false)); }}>
                <Text style={s.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {/* Business Detail */}
          {business && !loading && (
            <>
              {/* Status Banner */}
              <View style={[s.statusBanner, { backgroundColor: sc.bg }]}>
                <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
                <Text style={[s.statusBannerText, { color: sc.text }]}>
                  {statusLabel(business.status)}
                </Text>
                {business.verified && (
                  <Text style={s.verifiedBadge}>✓ Verified</Text>
                )}
              </View>

              {/* Action Success */}
              {actionSuccess && (
                <View style={s.successBanner}>
                  <Text style={s.successText}>{actionSuccess}</Text>
                </View>
              )}

              {/* Main Card */}
              <View style={s.card}>
                {/* Cover Photo */}
                {isRemoteImageUrl(business.coverPhoto) ? (
                  <ExpoImage
                    source={{ uri: business.coverPhoto }}
                    style={s.coverImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={s.coverPlaceholder}>
                    <Text style={s.coverPlaceholderText}>
                      {business.coverPhoto
                        ? "🖼️ Cover photo not yet uploaded to cloud"
                        : "🏢 No Cover Photo"}
                    </Text>
                  </View>
                )}

                <View style={s.cardBody}>
                  {/* Business Info */}
                  <View style={s.titleRow}>
                    {isRemoteImageUrl(business.logo) ? (
                      <ExpoImage
                        source={{ uri: business.logo }}
                        style={s.logoImg}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={s.logoPlaceholder}>
                        <Text style={s.logoPlaceholderText}>
                          {business.businessName?.[0] || "B"}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.bizName}>{business.businessName}</Text>
                      <Text style={s.bizCategory}>{business.category}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  {business.description ? (
                    <Section title="About">
                      <Text style={s.bodyText}>{business.description}</Text>
                    </Section>
                  ) : null}

                  {/* Services */}
                  {business.services.length > 0 && (
                    <Section title="Services">
                      <View style={s.tagsWrap}>
                        {business.services.map((svc, i) => (
                          <View key={i} style={s.tag}>
                            <Text style={s.tagText}>{svc}</Text>
                          </View>
                        ))}
                      </View>
                    </Section>
                  )}

                  {/* Location */}
                  <Section title="Location">
                    <DetailRow label="Address" value={business.address} />
                    <DetailRow label="Locality" value={business.locality} />
                    <DetailRow label="City" value={business.city} />
                    {business.pincode ? (
                      <DetailRow label="Pincode" value={business.pincode} />
                    ) : null}
                    {business.location?.coordinates ? (
                      <DetailRow
                        label="Coordinates"
                        value={`${business.location.coordinates[1]}, ${business.location.coordinates[0]}`}
                      />
                    ) : null}
                  </Section>

                  {/* Contact */}
                  <Section title="Contact">
                    <DetailRow label="Phone" value={business.phone} />
                    {business.whatsapp ? (
                      <DetailRow label="WhatsApp" value={business.whatsapp} />
                    ) : null}
                    {business.email ? (
                      <DetailRow label="Email" value={business.email} />
                    ) : null}
                    {business.website ? (
                      <DetailRow label="Website" value={business.website} />
                    ) : null}
                  </Section>

                  {/* Hours */}
                  <Section title="Business Hours">
                    <DetailRow label="Hours" value={hoursDisplay} />
                    <DetailRow label="Closed Days" value={closedDaysDisplay} />
                  </Section>

                  {/* Photos */}
                  {(() => {
                    const remotePhotos = business.businessPhotos.filter(isRemoteImageUrl);
                    const totalPhotos = business.businessPhotos.length;

                    if (totalPhotos === 0) return null;

                    return (
                      <Section title={`Photos (${totalPhotos})`}>
                        {remotePhotos.length > 0 ? (
                          <View style={s.photosGrid}>
                            {remotePhotos.map((uri, idx) => (
                              <ExpoImage
                                key={idx}
                                source={{ uri }}
                                style={s.photo}
                                contentFit="cover"
                              />
                            ))}
                          </View>
                        ) : (
                          <View style={s.photoPlaceholder}>
                            <Text style={s.photoPlaceholderIcon}>🖼️</Text>
                            <Text style={s.photoPlaceholderText}>
                              {totalPhotos} photo{totalPhotos > 1 ? "s" : ""} selected but not yet uploaded to cloud storage
                            </Text>
                          </View>
                        )}
                      </Section>
                    );
                  })()}

                  {/* Meta */}
                  <Section title="Submission Info">
                    <DetailRow label="ID" value={business._id} />
                    <DetailRow
                      label="Submitted"
                      value={formatDate(business.createdAt)}
                    />
                    <DetailRow
                      label="Updated"
                      value={formatDate(business.updatedAt)}
                    />
                    {business.verifiedAt ? (
                      <DetailRow
                        label="Verified At"
                        value={formatDate(business.verifiedAt)}
                      />
                    ) : null}
                    {business.adminNotes ? (
                      <DetailRow label="Admin Notes" value={business.adminNotes} />
                    ) : null}
                    {business.rejectionReason ? (
                      <DetailRow
                        label="Rejection Reason"
                        value={business.rejectionReason}
                      />
                    ) : null}
                  </Section>
                </View>
              </View>

              {/* ============================================ */}
              {/* APPROVED BANNER                              */}
              {/* ============================================ */}
              {business.status === "approved" && (
                <View style={s.approvedBanner}>
                  <Text style={s.approvedText}>
                    ✅ This business is approved and publicly visible.
                  </Text>
                </View>
              )}

              {/* ============================================ */}
              {/* ADMIN ACTIONS                                */}
              {/* ============================================ */}
              <View style={s.actionsCard}>
                <Text style={s.actionsTitle}>Admin Actions</Text>

                {/* Action Error */}
                {actionError && (
                  <View style={s.actionErrorBanner}>
                    <Text style={s.actionErrorText}>⚠️ {actionError}</Text>
                  </View>
                )}

                {/* Reason Input (for changes / reject) */}
                {(actionMode === "changes" || actionMode === "reject") && (
                  <View style={s.reasonBox}>
                    <Text style={s.reasonLabel}>
                      {actionMode === "changes"
                        ? "Reason for requesting changes:"
                        : "Reason for rejection:"}
                    </Text>
                    <TextInput
                      style={s.reasonInput}
                      placeholder="Enter reason..."
                      placeholderTextColor={SLATE_400}
                      value={reason}
                      onChangeText={setReason}
                      multiline
                      numberOfLines={3}
                      editable={!actionLoading}
                    />
                    <View style={s.reasonActions}>
                      <Pressable
                        onPress={() => {
                          setActionMode(null);
                          setReason("");
                          setActionError(null);
                        }}
                        style={s.cancelBtn}
                        disabled={actionLoading}
                      >
                        <Text style={s.cancelBtnText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAction(actionMode)}
                        disabled={actionLoading}
                        style={[
                          s.confirmBtn,
                          actionMode === "reject"
                            ? { backgroundColor: DANGER }
                            : { backgroundColor: BRAND },
                        ]}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color={WHITE} size="small" />
                        ) : (
                          <Text style={s.confirmBtnText}>
                            {actionMode === "changes"
                              ? "Submit Changes Request"
                              : "Confirm Rejection"}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                {!actionMode && (
                  <View style={s.actionButtons}>
                    {business.status !== "approved" && (
                      <>
                        <Pressable
                          onPress={() => confirmAction("approve")}
                          disabled={actionLoading}
                          style={({ pressed }) => [
                            s.actionBtn,
                            s.approveBtn,
                            { opacity: pressed ? 0.85 : 1 },
                          ]}
                        >
                          {actionLoading ? (
                            <ActivityIndicator color={WHITE} size="small" />
                          ) : (
                            <Text style={s.actionBtnText}>✓ Approve</Text>
                          )}
                        </Pressable>

                        <Pressable
                          onPress={() => confirmAction("changes")}
                          disabled={actionLoading}
                          style={({ pressed }) => [
                            s.actionBtn,
                            s.changesBtn,
                            { opacity: pressed ? 0.85 : 1 },
                          ]}
                        >
                          <Text style={s.actionBtnTextDark}>
                            ✏️ Request Changes
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => confirmAction("reject")}
                          disabled={actionLoading}
                          style={({ pressed }) => [
                            s.actionBtn,
                            s.rejectBtn,
                            { opacity: pressed ? 0.85 : 1 },
                          ]}
                        >
                          <Text style={s.actionBtnText}>✕ Reject</Text>
                        </Pressable>
                      </>
                    )}

                    {/* Delete Action (available for approved and all businesses) */}
                    <Pressable
                      onPress={() => confirmAction("delete")}
                      disabled={actionLoading}
                      style={({ pressed }) => [
                        s.actionBtn,
                        s.deleteActionBtn,
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="#DC2626" size="small" />
                      ) : (
                        <Text style={s.deleteActionBtnText}>🗑️ Delete Business</Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* HELPER COMPONENTS                                                */
/* ---------------------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* STYLES                                                           */
/* ---------------------------------------------------------------- */

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: SLATE_50 },
  center: { justifyContent: "center", alignItems: "center" },

  /* Top Bar */
  topBar: {
    backgroundColor: SLATE_900,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBarInner: {
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  backBtnText: {
    color: SLATE_300,
    fontSize: 12,
    fontWeight: "700",
    ...WEB_FONT,
  },
  topBarTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "900",
    ...WEB_FONT,
  },

  scrollContent: { paddingVertical: 24, alignItems: "center" },
  container: { width: "100%", maxWidth: 900, paddingBottom: 40 },

  loadingText: { color: SLATE_500, fontSize: 13, marginTop: 12, ...WEB_FONT },

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
  errorTextBanner: { color: "#991B1B", fontSize: 13, fontWeight: "700", flex: 1, ...WEB_FONT },
  retryText: { color: BRAND, fontSize: 13, fontWeight: "800", marginLeft: 12, ...WEB_FONT },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBannerText: { fontSize: 13, fontWeight: "800", ...WEB_FONT },
  verifiedBadge: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: "auto",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    ...WEB_FONT,
  },

  successBanner: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  successText: { color: "#065F46", fontSize: 13, fontWeight: "800", ...WEB_FONT },

  approvedBanner: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    alignItems: "center",
  },
  approvedText: { color: "#065F46", fontSize: 14, fontWeight: "800", ...WEB_FONT },

  /* Card */
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }
      : {}),
  },
  coverImage: { width: "100%", height: 180 },
  coverPlaceholder: {
    height: 120,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  coverPlaceholderText: { fontSize: 14, color: SLATE_400, fontWeight: "700", ...WEB_FONT },
  cardBody: { padding: 24 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  logoImg: { width: 52, height: 52, borderRadius: 14, borderWidth: 2, borderColor: SLATE_100 },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: { color: WHITE, fontSize: 22, fontWeight: "900" },
  bizName: { fontSize: 20, fontWeight: "900", color: SLATE_900, letterSpacing: -0.3, ...WEB_FONT },
  bizCategory: { fontSize: 13, fontWeight: "700", color: BRAND, marginTop: 2, ...WEB_FONT },

  /* Sections */
  section: {
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: SLATE_900, marginBottom: 10, ...WEB_FONT },
  bodyText: { fontSize: 13, color: SLATE_700, lineHeight: 20, ...WEB_FONT },

  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: { fontSize: 12, fontWeight: "700", color: SLATE_800, ...WEB_FONT },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    gap: 12,
  },
  detailLabel: { fontSize: 12, fontWeight: "700", color: SLATE_500, ...WEB_FONT },
  detailValue: { fontSize: 12, fontWeight: "800", color: SLATE_900, flex: 1, textAlign: "right", ...WEB_FONT },

  photosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photo: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: SLATE_200 },
  photoPlaceholder: {
    backgroundColor: SLATE_50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  photoPlaceholderIcon: { fontSize: 28 },
  photoPlaceholderText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_500,
    textAlign: "center",
    ...WEB_FONT,
  },

  /* Actions */
  actionsCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  actionsTitle: { fontSize: 16, fontWeight: "900", color: SLATE_900, marginBottom: 16, ...WEB_FONT },

  actionErrorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  actionErrorText: { color: "#991B1B", fontSize: 12, fontWeight: "700", ...WEB_FONT },

  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    minWidth: 140,
  },
  approveBtn: {
    backgroundColor: SUCCESS,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 3px 12px rgba(16,185,129,0.25)" }
      : {}),
  },
  changesBtn: {
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: SLATE_200,
  },
  rejectBtn: {
    backgroundColor: DANGER,
  },
  deleteActionBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
  },
  actionBtnText: { color: WHITE, fontSize: 14, fontWeight: "900", ...WEB_FONT },
  actionBtnTextDark: { color: SLATE_800, fontSize: 14, fontWeight: "800", ...WEB_FONT },
  deleteActionBtnText: { color: "#DC2626", fontSize: 14, fontWeight: "800", ...WEB_FONT },

  /* Reason Input */
  reasonBox: {
    backgroundColor: SLATE_50,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  reasonLabel: { fontSize: 13, fontWeight: "700", color: SLATE_700, marginBottom: 8, ...WEB_FONT },
  reasonInput: {
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: SLATE_900,
    minHeight: 80,
    textAlignVertical: "top",
    ...WEB_FONT,
  },
  reasonActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SLATE_200,
    backgroundColor: WHITE,
  },
  cancelBtnText: { color: SLATE_700, fontSize: 13, fontWeight: "700", ...WEB_FONT },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnText: { color: WHITE, fontSize: 13, fontWeight: "800", ...WEB_FONT },
});
