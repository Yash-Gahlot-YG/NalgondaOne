import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_700,
  SLATE_500,
  SLATE_400,
  SLATE_200,
  SLATE_100,
  SLATE_50,
  WHITE,
  WEB_FONT,
  CONTENT_MAX_WIDTH,
} from "@/constants/serviceTheme";
import { nalgondaLocations, LocationOption } from "@/data/services";

interface LocationSelectorModalProps {
  visible: boolean;
  selectedLocation: LocationOption;
  onSelect: (location: LocationOption) => void;
  onClose: () => void;
}

export default function LocationSelectorModal({
  visible,
  selectedLocation,
  onSelect,
  onClose,
}: LocationSelectorModalProps) {
  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close modal overlay"
        />
        <View style={s.modalCard}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Select Location</Text>
              <Text style={s.subtitle}>
                Showing services around Nalgonda district
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                s.closeBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={s.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Location List */}
          <View style={s.list}>
            {nalgondaLocations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              return (
                <Pressable
                  key={loc.id}
                  onPress={() => {
                    onSelect(loc);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    s.locationItem,
                    isSelected && s.locationItemSelected,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <View style={s.locLeft}>
                    <View
                      style={[
                        s.pinWrap,
                        isSelected && s.pinWrapSelected,
                      ]}
                    >
                      <Text style={s.pinIcon}>📍</Text>
                    </View>
                    <View>
                      <View style={s.locNameRow}>
                        <Text
                          style={[
                            s.locName,
                            isSelected && s.locNameSelected,
                          ]}
                        >
                          {loc.name}
                        </Text>
                        {loc.isPopular && (
                          <View style={s.popularTag}>
                            <Text style={s.popularTagText}>Popular</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.locArea}>{loc.area}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      s.radioCircle,
                      isSelected && s.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={s.radioInner} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    ...(Platform.OS === "web"
      ? {
          backdropFilter: "blur(4px)" as any,
          WebkitBackdropFilter: "blur(4px)" as any,
        }
      : {}),
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
        }
      : {
          elevation: 10,
        }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.3,
    ...WEB_FONT,
  },
  subtitle: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 4,
    ...WEB_FONT,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: "700",
    color: SLATE_700,
  },
  list: {
    gap: 8,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SLATE_100,
    backgroundColor: SLATE_50,
  },
  locationItemSelected: {
    borderColor: BRAND,
    backgroundColor: "#EFF6FF",
  },
  locLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pinWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  pinWrapSelected: {
    borderColor: "#BFDBFE",
    backgroundColor: "#DBEAFE",
  },
  pinIcon: {
    fontSize: 16,
  },
  locNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locName: {
    fontSize: 15,
    fontWeight: "700",
    color: SLATE_900,
    ...WEB_FONT,
  },
  locNameSelected: {
    color: BRAND,
  },
  popularTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
    ...WEB_FONT,
  },
  locArea: {
    fontSize: 12,
    color: SLATE_500,
    marginTop: 2,
    ...WEB_FONT,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: SLATE_400,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: BRAND,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND,
  },
});
