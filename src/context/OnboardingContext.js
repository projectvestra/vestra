import { createContext, useContext, useState } from "react";

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [preferences, setPreferences] = useState({
    styles: [],
    preferredColors: [],
    bodyType: "",
    height: "",
    constraints: [],
    primaryOccasions: []
  });

  const updatePreferences = (updates) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <OnboardingContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}