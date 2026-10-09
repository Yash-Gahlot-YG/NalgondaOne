import React from "react";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_700,
  SLATE_500,
  SLATE_400,
  SLATE_300,
  SLATE_200,
  SLATE_100,
  SLATE_50,
  WHITE,
  WEB_FONT,
} from "@/constants/serviceTheme";

interface SingleImagePickerProps {
  label: string;
  helperText?: string;
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  aspectRatio?: [number, number];
  height?: number;
}

export function SingleImagePicker({
  label,
  helperText,
  imageUri,
  onImageSelected,
  onImageRemoved,
  aspectRatio,
  height = 140,
}: SingleImagePickerProps) {
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        const msg = "Permission to access media library is required.";
        if (Platform.OS === "web") {
          window.alert(msg);
        } else {
          Alert.alert("Permission Required", msg);
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: Boolean(aspectRatio),
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>{label}</Text>
      {helperText && <Text style={s.helperText}>{helperText}</Text>}

      {imageUri ? (
        <View style={[s.previewContainer, { height }]}>
          <ExpoImage
            source={{ uri: imageUri }}
            style={s.imagePreview}
            contentFit="cover"
            transition={150}
          />
          <View style={s.previewOverlay}>
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                s.actionPill,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Change selected photo"
            >
              <Text style={s.actionPillText}>Change</Text>
            </Pressable>
            <Pressable
              onPress={onImageRemoved}
              style={({ pressed }) => [
                s.actionPillDanger,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Remove selected photo"
            >
              <Text style={s.actionPillDangerText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={pickImage}
          style={({ pressed, hovered }: any) => [
            s.dropzone,
            { height },
            { transform: [{ scale: pressed ? 0.99 : 1 }] },
            Platform.OS === "web" && hovered ? s.dropzoneHovered : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Upload ${label}`}
        >
          <View style={s.iconCircle}>
            <Text style={s.uploadIcon}>📸</Text>
          </View>
          <Text style={s.dropzoneText}>Click / Tap to Select Image</Text>
          <Text style={s.dropzoneSubText}>PNG, JPG or WEBP (Max 5MB)</Text>
        </Pressable>
      )}
    </View>
  );
}

interface MultiImagePickerProps {
  label: string;
  helperText?: string;
  images: string[];
  onAddImage: (uri: string) => void;
  onRemoveImage: (index: number) => void;
}

export function MultiImagePicker({
  label,
  helperText,
  images,
  onAddImage,
  onRemoveImage,
}: MultiImagePickerProps) {
  const pickImages = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        const msg = "Permission to access media library is required.";
        if (Platform.OS === "web") {
          window.alert(msg);
        } else {
          Alert.alert("Permission Required", msg);
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach((asset) => {
          if (asset.uri) onAddImage(asset.uri);
        });
      }
    } catch (err) {
      console.error("Error picking multiple images:", err);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.labelRow}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.countBadge}>{images.length} added</Text>
      </View>
      {helperText && <Text style={s.helperText}>{helperText}</Text>}

      {/* Grid of images */}
      <View style={s.multiGrid}>
        {images.map((uri, idx) => (
          <View key={`${uri}-${idx}`} style={s.multiGridItem}>
            <ExpoImage
              source={{ uri }}
              style={s.multiImagePreview}
              contentFit="cover"
              transition={150}
            />
            <Pressable
              onPress={() => onRemoveImage(idx)}
              style={({ pressed }) => [
                s.removePhotoBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${idx + 1}`}
            >
              <Text style={s.removePhotoText}>✕</Text>
            </Pressable>
          </View>
        ))}

        {/* Add more button */}
        <Pressable
          onPress={pickImages}
          style={({ pressed, hovered }: any) => [
            s.addMoreBox,
            { transform: [{ scale: pressed ? 0.97 : 1 }] },
            Platform.OS === "web" && hovered ? s.addMoreBoxHovered : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add more business photos"
        >
          <Text style={s.addMoreIcon}>+</Text>
          <Text style={s.addMoreText}>Add Photo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    ...WEB_FONT,
  },
  helperText: {
    fontSize: 12,
    color: SLATE_500,
    marginBottom: 8,
    ...WEB_FONT,
  },
  dropzone: {
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: SLATE_300,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    ...(Platform.OS === "web"
      ? { cursor: "pointer", transition: "all 0.15s ease" } as any
      : {}),
  },
  dropzoneHovered: {
    borderColor: BRAND,
    backgroundColor: "#EFF6FF",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: SLATE_200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadIcon: {
    fontSize: 20,
  },
  dropzoneText: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  dropzoneSubText: {
    fontSize: 11,
    color: SLATE_400,
    marginTop: 2,
    ...WEB_FONT,
  },
  previewContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SLATE_200,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
  },
  actionPill: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionPillText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },
  actionPillDanger: {
    backgroundColor: "rgba(220, 38, 38, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionPillDangerText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* Multi-grid */
  multiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  multiGridItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SLATE_200,
    position: "relative",
  },
  multiImagePreview: {
    width: "100%",
    height: "100%",
  },
  removePhotoBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  removePhotoText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "900",
  },
  addMoreBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: SLATE_300,
    backgroundColor: SLATE_50,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { cursor: "pointer", transition: "all 0.15s ease" } as any
      : {}),
  },
  addMoreBoxHovered: {
    borderColor: BRAND,
    backgroundColor: "#EFF6FF",
  },
  addMoreIcon: {
    fontSize: 22,
    color: BRAND,
    fontWeight: "800",
  },
  addMoreText: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_700,
    marginTop: 2,
    ...WEB_FONT,
  },
});
