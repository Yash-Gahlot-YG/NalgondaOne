import {
  BusinessFormData,
  BusinessSubmission,
  INITIAL_FORM_DATA,
  getBusinessDraft,
  saveBusinessDraft,
} from "@/data/business";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AddBusinessContextType {
  formData: BusinessFormData;
  updateField: <K extends keyof BusinessFormData>(
    key: K,
    value: BusinessFormData[K]
  ) => void;
  updateFields: (fields: Partial<BusinessFormData>) => void;
  addService: (service: string) => void;
  removeService: (service: string) => void;
  toggleClosedDay: (day: string) => void;
  addBusinessPhoto: (uri: string) => void;
  removeBusinessPhoto: (index: number) => void;
  resetForm: () => void;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  isStep3Valid: boolean;
  lastSubmitted: BusinessSubmission | null;
  setLastSubmitted: (sub: BusinessSubmission | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const AddBusinessContext = createContext<AddBusinessContextType | undefined>(
  undefined
);

export function AddBusinessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [formData, setFormData] = useState<BusinessFormData>(INITIAL_FORM_DATA);
  const [lastSubmitted, setLastSubmitted] = useState<BusinessSubmission | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    getBusinessDraft().then((draft) => {
      if (draft && draft.businessName) {
        setFormData(draft);
      }
    });
  }, []);

  const updateField = <K extends keyof BusinessFormData>(
    key: K,
    value: BusinessFormData[K]
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      saveBusinessDraft(next);
      return next;
    });
  };

  const updateFields = (fields: Partial<BusinessFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      saveBusinessDraft(next);
      return next;
    });
  };

  const addService = (service: string) => {
    const trimmed = service.trim();
    if (!trimmed) return;
    if (formData.services.includes(trimmed)) return;
    updateField("services", [...formData.services, trimmed]);
  };

  const removeService = (service: string) => {
    updateField(
      "services",
      formData.services.filter((s) => s !== service)
    );
  };

  const toggleClosedDay = (day: string) => {
    const exists = formData.closedDays.includes(day);
    if (exists) {
      updateField(
        "closedDays",
        formData.closedDays.filter((d) => d !== day)
      );
    } else {
      updateField("closedDays", [...formData.closedDays, day]);
    }
  };

  const addBusinessPhoto = (uri: string) => {
    if (!uri) return;
    if (formData.businessPhotos.includes(uri)) return;
    updateField("businessPhotos", [...formData.businessPhotos, uri]);
  };

  const removeBusinessPhoto = (index: number) => {
    updateField(
      "businessPhotos",
      formData.businessPhotos.filter((_, i) => i !== index)
    );
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  // Step Validations
  const isStep1Valid = Boolean(
    formData.businessName.trim().length >= 2 && formData.category.trim()
  );

  const isStep2Valid = Boolean(
    formData.address.trim().length >= 3 &&
    formData.locality.trim() &&
    formData.phone.trim().replace(/[^0-9]/g, "").length >= 10
  );

  const isStep3Valid = true; // Photos and hours have sensible defaults

  return (
    <AddBusinessContext.Provider
      value={{
        formData,
        updateField,
        updateFields,
        addService,
        removeService,
        toggleClosedDay,
        addBusinessPhoto,
        removeBusinessPhoto,
        resetForm,
        isStep1Valid,
        isStep2Valid,
        isStep3Valid,
        lastSubmitted,
        setLastSubmitted,
        isSubmitting,
        setIsSubmitting,
      }}
    >
      {children}
    </AddBusinessContext.Provider>
  );
}

export function useAddBusiness() {
  const context = useContext(AddBusinessContext);
  if (!context) {
    throw new Error("useAddBusiness must be used within an AddBusinessProvider");
  }
  return context;
}
