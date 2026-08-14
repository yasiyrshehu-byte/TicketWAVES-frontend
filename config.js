window.TW_CONFIG = {
  // Your Render service URL. Do not add /api here.
  API_BASE_URL: "https://ticketwaves-backend-3.onrender.com",
  API_PREFIX: "/api",

  // API is the source of truth. Local storage is only a temporary offline cache.
  ENABLE_OFFLINE_CACHE: true,
  CACHE_TTL_MS: 5 * 60 * 1000,

  // The frontend accepts gallery images and compresses them before sending.
  MAX_IMAGE_WIDTH: 1400,
  IMAGE_QUALITY: 0.82
};

function twApiRoot() {
  return (window.TW_CONFIG.API_BASE_URL || "").replace(/\/+$/, "") + (window.TW_CONFIG.API_PREFIX || "");
}
