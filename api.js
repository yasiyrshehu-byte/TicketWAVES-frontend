(() => {
  const C = window.TW_CONFIG;
  const cacheKey = (path) => "tw_cache:" + path;
  const token = () => localStorage.getItem("tw_token") || localStorage.getItem("token") || "";

  async function request(path, options = {}) {
    const url = twApiRoot() + (path.startsWith("/") ? path : "/" + path);
    const headers = new Headers(options.headers || {});
    if (token()) headers.set("Authorization", "Bearer " + token());
    let body = options.body;

    if (body && !(body instanceof FormData) && typeof body !== "string") {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    const res = await fetch(url, { ...options, headers, body });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

    if (!res.ok) {
      const err = new Error(data?.message || data?.error || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function get(path, opts = {}) {
    try {
      const data = await request(path, { method: "GET", ...opts });
      if (C.ENABLE_OFFLINE_CACHE) localStorage.setItem(cacheKey(path), JSON.stringify({ at: Date.now(), data }));
      return data;
    } catch (e) {
      if (C.ENABLE_OFFLINE_CACHE) {
        try {
          const saved = JSON.parse(localStorage.getItem(cacheKey(path)) || "null");
          if (saved && Date.now() - saved.at < C.CACHE_TTL_MS * 24) {
            return saved.data;
          }
        } catch {}
      }
      throw e;
    }
  }

  async function send(path, method, body) {
    return request(path, { method, body });
  }

  async function upload(path, fields, file) {
    const fd = new FormData();
    Object.entries(fields || {}).forEach(([k,v]) => {
      if (v !== undefined && v !== null) fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
    });
    if (file) fd.append("image", file, file.name || "event-image.jpg");
    return request(path, { method: "POST", body: fd });
  }

  window.TWAPI = { request, get, send, upload, token, cacheKey };
})();
