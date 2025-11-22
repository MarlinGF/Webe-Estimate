const DEFAULT_MAIN_APP_ORIGIN = process.env.NEXT_PUBLIC_FALLBACK_WEBE_ORIGIN || 'https://app.webe.ws';
const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_FALLBACK_WEBE_API_BASE_URL || DEFAULT_MAIN_APP_ORIGIN;

const stripTrailingSlash = (value: string) => {
  if (!value) return value;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const appConfig = {
  get mainAppOrigin() {
    const origin = process.env.NEXT_PUBLIC_WEBE_APP_ORIGIN || DEFAULT_MAIN_APP_ORIGIN;
    return stripTrailingSlash(origin);
  },
  get apiBaseUrl() {
    const baseUrl = process.env.NEXT_PUBLIC_WEBE_API_BASE_URL || DEFAULT_API_BASE_URL;
    return stripTrailingSlash(baseUrl);
  },
  get estimatorOrigin() {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_ESTIMATOR_ORIGIN || '';
  },
  get allowAnonymousFallback() {
    return process.env.NEXT_PUBLIC_ALLOW_ANON_FALLBACK === 'true';
  },
};
