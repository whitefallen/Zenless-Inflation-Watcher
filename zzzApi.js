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
    // The in-game event site serves the v2 endpoints from the "act" host.
    // Both hosts route hadal_mem_detail_v2, but this is the one HoyoLab itself
    // calls, so it is tried first.
    this.actBaseUrl =
      "https://sg-act-public-api.hoyolab.com/event/game_record_zzz/api/zzz";
  }

  async _getJson(url) {
    const res = await fetch(url, { headers: this._getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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

  // Fetch Shiyu Defense / Hadal Blacksite detail data
  async getHadalInfoV2({ uid, schedule_type = 1 }) {
    const query = `role_id=${uid}&server=${this.server}&schedule_type=${schedule_type}`;
    return this._getJson(`${this.baseUrl}/hadal_info_v2?${query}`);
  }

  // Fetch Deadly Assault (Memory) detail data — v2 endpoint.
  // Supersedes mem_detail, which has returned has_data:false / zone_id:0 for
  // every cycle since 2026-07-29. Falls back to the non-act host, which routes
  // the same path, before the caller drops to v1.
  async getHadalMemDetailV2({ uid, schedule_type = 1 }) {
    const query = `uid=${uid}&region=${this.server}&schedule_type=${schedule_type}`;
    try {
      return await this._getJson(
        `${this.actBaseUrl}/hadal_mem_detail_v2?${query}`,
      );
    } catch {
      return this._getJson(`${this.baseUrl}/hadal_mem_detail_v2?${query}`);
    }
  }

  // Fetch Deadly Assault (Memory) detail data — legacy v1 endpoint, kept as a
  // fallback for older schedule_types that may still be served by it.
  async getMemoryDetail({ uid, schedule_type = 1 }) {
    const query = `uid=${uid}&region=${this.server}&schedule_type=${schedule_type}`;
    return this._getJson(`${this.baseUrl}/mem_detail?${query}`);
  }

  // Fetch Void Front battle detail data
  async getVoidFrontDetail({ uid, schedule_type = 1 }) {
    const query = `uid=${uid}&region=${this.server}&schedule_type=${schedule_type}`;
    return this._getJson(
      `${this.baseUrl}/void_front_battle_period_detail?${query}`,
    );
  }
}

module.exports = ZZZApi;
