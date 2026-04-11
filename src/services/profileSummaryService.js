import Constants from 'expo-constants';

const expoExtra = Constants.expoConfig?.extra || {};
const configuredApiUrl =
  expoExtra.recommendation?.apiUrl ||
  expoExtra.backend?.apiUrl ||
  process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_API_URL ||
  '';

const normalizedApiUrl =
  configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl)
    ? `https://${configuredApiUrl}`
    : configuredApiUrl;

const API_BASE = normalizedApiUrl.replace(/\/$/, '');

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Backend request failed (${response.status}): ${body || response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function buildFallbackSummary(styles = [], colors = [], bodyType = '') {
  const styleText = Array.isArray(styles) && styles.length ? styles.slice(0, 3).join(', ') : 'clean style';
  const colorText = Array.isArray(colors) && colors.length ? colors.slice(0, 3).join(', ') : 'neutral colors';
  const fitText = bodyType || 'balanced fit';
  return `Style: ${styleText}. Fit: ${fitText}. Colors: ${colorText}.`;
}

export async function getProfileStyleSummary({ styles = [], colors = [], bodyType = '' } = {}) {
  if (!API_BASE) {
    return {
      summary: buildFallbackSummary(styles, colors, bodyType),
      source: 'local-fallback',
    };
  }

  try {
    const data = await fetchJsonWithTimeout(`${API_BASE}/profile-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ styles, colors, bodyType }),
    }, 9000);

    return {
      summary: data?.summary || buildFallbackSummary(styles, colors, bodyType),
      source: data?.source || 'ai',
    };
  } catch (error) {
    return {
      summary: buildFallbackSummary(styles, colors, bodyType),
      source: 'local-fallback',
      error: error?.message || 'Failed to load profile summary',
    };
  }
}