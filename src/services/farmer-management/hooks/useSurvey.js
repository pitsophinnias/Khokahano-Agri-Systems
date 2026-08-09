// ---------------------------------------------------------------------------
// useSurvey.js
// Manages loading an existing survey response and submitting a new one.
// Lives at: src/services/farmer-management/hooks/useSurvey.js
//
// Field names match the backend surveys.service.js exactly:
//   vaccinationPractice, diseaseChallenges, mortalityRatePercent,
//   marketAccessChallenges, packagingMethod (array)
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from "react";
import { fetchMySurvey, submitSurvey } from "../../marketplace/api/marketplace.api.js";

const EMPTY_FORM = {
  // Poultry types — multi-select
  poultryTypes:    [],       // ["broilers", "layers", "indigenous", "eggs"]

  // Bird counts
  totalBirds:      "",
  broilerCount:    "",
  layerCount:      "",
  indigenousCount: "",

  // Housing & management
  housingSystem:  "",        // "deep_litter" | "cage" | "free_range" | "open_yard"
  feedingMethod:  "",        // "commercial" | "homemix" | "both" | "scavenging"
  feedBrand:      "",        // free text

  // Vaccination — field name matches backend: vaccinationPractice
  vaccinationPractice: "",   // "yes" | "no" | "sometimes"
  vaccinesUsed:        [],   // ["newcastle", "gumboro", "marek", "fowlpox", "other"]

  // Health & mortality — field names match backend
  diseaseChallenges:    [],  // multi-select
  mortalityRatePercent: "",  // percentage string e.g. "5"

  // Market & output — field names match backend
  marketAccessChallenges: "", // free text
  packagingMethod:        [], // array — multi-select (farmer may sell live AND dressed)
};

export function useSurvey() {
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [existing,    setExisting]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Load existing survey on mount — pre-fill if farmer already answered
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMySurvey();
        if (!cancelled && data) {
          setExisting(data);
          setForm({
            poultryTypes:           data.poultryTypes            ?? [],
            totalBirds:             String(data.totalBirds       ?? ""),
            broilerCount:           String(data.broilerCount     ?? ""),
            layerCount:             String(data.layerCount       ?? ""),
            indigenousCount:        String(data.indigenousCount  ?? ""),
            housingSystem:          data.housingSystem           ?? "",
            feedingMethod:          data.feedingMethod           ?? "",
            feedBrand:              data.feedBrand               ?? "",
            vaccinationPractice:    data.vaccinationPractice     ?? "",
            vaccinesUsed:           data.vaccinesUsed            ?? [],
            diseaseChallenges:      data.diseaseChallenges       ?? [],
            mortalityRatePercent:   String(data.mortalityRatePercent ?? ""),
            marketAccessChallenges: data.marketAccessChallenges  ?? "",
            // packagingMethod may be a string (old data) or array — normalise to array
            packagingMethod: Array.isArray(data.packagingMethod)
              ? data.packagingMethod
              : data.packagingMethod ? [data.packagingMethod] : [],
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Could not load survey");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayField = useCallback((field, value) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        poultryTypes:           form.poultryTypes,
        totalBirds:             parseInt(form.totalBirds)            || 0,
        broilerCount:           parseInt(form.broilerCount)          || 0,
        layerCount:             parseInt(form.layerCount)            || 0,
        indigenousCount:        parseInt(form.indigenousCount)       || 0,
        housingSystem:          form.housingSystem,
        feedingMethod:          form.feedingMethod,
        feedBrand:              form.feedBrand,
        vaccinationPractice:    form.vaccinationPractice,
        vaccinesUsed:           form.vaccinesUsed,
        diseaseChallenges:      form.diseaseChallenges,
        mortalityRatePercent:   parseFloat(form.mortalityRatePercent) || 0,
        marketAccessChallenges: form.marketAccessChallenges,
        packagingMethod:        form.packagingMethod,
      };
      const result = await submitSurvey(payload);
      setExisting(result);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const resetSubmitted = useCallback(() => setSubmitted(false), []);

  return {
    form,
    setField,
    toggleArrayField,
    existing,
    loading,
    submitting,
    submitted,
    error,
    submitError,
    submit,
    resetSubmitted,
  };
}