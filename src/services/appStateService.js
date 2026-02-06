// Temporary app state logic
// Replace with backend / storage later

let onboardingCompleted = false;

export function completeOnboarding() {
  onboardingCompleted = true;
}

export function isOnboardingComplete() {
  return onboardingCompleted;
}
