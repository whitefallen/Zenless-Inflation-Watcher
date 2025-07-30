// Minimal Zenless Zone Zero Hoyolab API wrapper
// Now supports passing a full cookie string or an object with all relevant cookies.
// Usage:
//   const api = new ZZZApi({ cookies: { ltuid_v2, ltoken_v2, ... }, role_id });
//   OR
//   const api = new ZZZApi({ cookieString: 'ltuid_v2=...; ltoken_v2=...; ...', role_id });
//   api.getChallenge().then(console.log);

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const crypto = require("crypto");

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
    // Build from cookies object
    const keys = [
      "ltuid_v2",
      "ltoken_v2",
      //"cookie_token_v2",
      //"account_id_v2",
      //"account_mid_v2",
      //"ltmid_v2",
      //_MHYUUID",
      //"DEVICEFP",
      //"DEVICEFP_SEED_ID",
      // "DEVICEFP_SEED_TIME",
      // fallback to v1 if v2 not present
      //"ltuid",
      //"ltoken",
      //"cookie_token",
      //"account_id",
      //"account_mid",
      //"ltmid",
    ];
    return keys
      .map((key) => (this.cookies[key] ? `${key}=${this.cookies[key]}` : null))
      .filter(Boolean)
      .join("; ");
  }

  // Helper to generate DS header (mihoyo_bbs style)
  _generateDS(query = "", body = "") {
    const salt = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs";
    const t = Math.floor(Date.now() / 1000);
    const r = Math.random().toString(36).slice(2, 8);
    const check = crypto
      .createHash("md5")
      .update(`salt=${salt}&t=${t}&r=${r}&b=${body}&q=${query}`)
      .digest("hex");
    return `${t},${r},${check}`;
  }

  _getHeaders(query = "", body = "") {
    return {
      Cookie: this._buildCookieHeader(),
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
      DS: this._generateDS(query, body),
      "x-rpc-app_version": "2.34.1",
      "x-rpc-client_type": "5",
      "x-rpc-language": "en-us",
      Referer: "https://act.hoyolab.com/",
      Origin: "https://act.hoyolab.com",
    };
  }

  // Fetch Shiyu Defense (Challenge) detail data
  async getChallenge({ uid, schedule_type = 1 }) {
    const query = `server=${this.server}&role_id=${uid}&schedule_type=${schedule_type}`;
    const url = `${this.baseUrl}/challenge?${query}`;
    const res = await fetch(url, { headers: this._getHeaders(query, "") });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Fetch Deadly Assault (Memory) detail data
  async getMemoryDetail({ uid, schedule_type = 1 }) {
    const query = `uid=${uid}&region=${this.server}&schedule_type=${schedule_type}`;
    const url = `${this.baseUrl}/mem_detail?${query}`;
    const res = await fetch(url, { headers: this._getHeaders(query, "") });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

module.exports = ZZZApi;
