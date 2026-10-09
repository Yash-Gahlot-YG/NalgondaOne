import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_700,
  SLATE_500,
  SLATE_400,
  SLATE_200,
  SLATE_100,
  WHITE,
  SUCCESS,
  WEB_FONT,
} from "@/constants/serviceTheme";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { step: 1, title: "Business Details", desc: "Name & Category" },
  { step: 2, title: "Location & Contact", desc: "Address & Phone" },
  { step: 3, title: "Photos & Hours", desc: "Images & Timing" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const isPreview = currentStep === 4;

  return (
    <View style={s.container}>
      {/* Top step counter text */}
      <View style={s.topRow}>
        <Text style={s.stepCounter}>
          {isPreview ? "FINAL PREVIEW" : `STEP ${currentStep} OF 3`}
        </Text>
        <Text style={s.stepTitle}>
          {isPreview
            ? "Review Your Business Listing"
            : STEPS[currentStep - 1]?.title}
        </Text>
      </View>

      {/* Progress Bars */}
      <View style={s.progressRow}>
        {STEPS.map((item) => {
          const isCompleted = currentStep > item.step || isPreview;
          const isCurrent = currentStep === item.step;

          return (
            <View key={item.step} style={s.stepSegment}>
              <View
                style={[
                  s.progressBar,
                  isCompleted && s.progressBarCompleted,
                  isCurrent && s.progressBarCurrent,
                ]}
              />
              <View style={s.stepLabelRow}>
                <View
                  style={[
                    s.stepNumberDot,
                    isCompleted && s.stepNumberDotCompleted,
                    isCurrent && s.stepNumberDotCurrent,
                  ]}
                >
                  <Text
                    style={[
                      s.stepNumberText,
                      (isCompleted || isCurrent) && s.stepNumberTextActive,
                    ]}
                  >
                    {isCompleted ? "✓" : item.step}
                  </Text>
                </View>
                <Text
                  style={[
                    s.stepLabelText,
                    isCurrent && s.stepLabelTextCurrent,
                    isCompleted && s.stepLabelTextCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 24,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }
      : {}),
  },
  topRow: {
    marginBottom: 16,
  },
  stepCounter: {
    fontSize: 11,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: 1,
    ...WEB_FONT,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.3,
    marginTop: 2,
    ...WEB_FONT,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepSegment: {
    flex: 1,
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: SLATE_100,
    marginBottom: 8,
  },
  progressBarCurrent: {
    backgroundColor: BRAND,
  },
  progressBarCompleted: {
    backgroundColor: SUCCESS,
  },
  stepLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepNumberDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberDotCurrent: {
    backgroundColor: BRAND,
  },
  stepNumberDotCompleted: {
    backgroundColor: SUCCESS,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: SLATE_500,
  },
  stepNumberTextActive: {
    color: WHITE,
  },
  stepLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: SLATE_400,
    flex: 1,
    ...WEB_FONT,
  },
  stepLabelTextCurrent: {
    color: SLATE_900,
    fontWeight: "700",
  },
  stepLabelTextCompleted: {
    color: SLATE_700,
  },
});
