// Minimal Zenless Zone Zero Hoyolab API wrapper
// Now supports passing a full cookie string or an object with all relevant cookies.
// Usage:
//   const api = new ZZZApi({ cookies: { ltuid_v2, ltoken_v2, ... }, role_id });
//   OR
//   const api = new ZZZApi({ cookieString: 'ltuid_v2=...; ltoken_v2=...; ...', role_id });
//   api.getChallenge().then(console.log);

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

class ZZZApi {
  constructor({ cookies = {}, cookieString = "", uid }) {
    this.cookies = cookies;
    this.cookieString = cookieString;
    this.server = "prod_gf_eu";
    this.role_id = uid;
    this.baseUrl =
      "https://sg-public-api.hoyolab.com/event/game_record_zzz/api/zzz";
  }

  // Helper to build the Cookie header
  _buildCookieHeader() {
    if (this.cookieString) return this.cookieString;
    // Build from cookies object - include all necessary cookies from working browser request
    const keys = [
      "mi18nLang",
      "_HYVUUID",
      "_MHYUUID",
      "cookie_token_v2",
      "account_mid_v2",
      "account_id_v2",
      "ltoken_v2",
      "ltmid_v2",
      "ltuid_v2",
      "DEVICEFP",
      // Additional cookies from HAR file
      "HYV_LOGIN_PLATFORM_OPTIONAL_AGREEMENT",
      "HYV_LOGIN_PLATFORM_LOAD_TIMEOUT",
      "HYV_LOGIN_PLATFORM_TRACKING_MAP",
      "HYV_LOGIN_PLATFORM_LIFECYCLE_ID",
      "DEVICEFP_SEED_ID",
      "DEVICEFP_SEED_TIME",
      // fallback to v1 if v2 not present
      "ltuid",
      "ltoken",
      "cookie_token",
      "account_id",
      "account_mid",
      "ltmid",
    ];
    const thekeys = keys
      .map((key) => (this.cookies[key] ? `${key}=${this.cookies[key]}` : null))
      .filter(Boolean)
      .join("; ");
    return thekeys;
  }

  _getHeaders() {
    return {
      Cookie: this._buildCookieHeader(),
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      Priority: "u=0, i",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
    };
  }

  // Fetch Shiyu Defense (Challenge) detail data
  async getChallenge({ uid, schedule_type = 1 }) {
    const query = `server=${this.server}&role_id=${uid}&schedule_type=${schedule_type}`;
    const url = `${this.baseUrl}/challenge?${query}`;
    const res = await fetch(url, { headers: this._getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Fetch Deadly Assault (Memory) detail data
  async getMemoryDetail({ uid, schedule_type = 1 }) {
    const query = `uid=${uid}&region=${this.server}&schedule_type=${schedule_type}`;
    const url = `${this.baseUrl}/mem_detail?${query}`;
    const res = await fetch(url, { headers: this._getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Fetch Void Front battle detail data
  async getVoidFrontDetail({ uid, void_front_id = 102 }) {
    const query = `uid=${uid}&region=${this.server}&void_front_id=${void_front_id}`;
    const url = `${this.baseUrl}/void_front_battle_detail?${query}`;
    const res = await fetch(url, { headers: this._getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

module.exports = ZZZApi;
