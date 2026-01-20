/**
 * ============================================
 * Universal Logout Handler v1.0.0
 * ============================================
 *
 * รองรับการลบ Authentication Data จาก:
 * - localStorage
 * - sessionStorage
 * - Cookies
 * - Custom storage (เช่น IndexedDB, Memory Store)
 *
 * รูปแบบ URL ที่รองรับ:
 * - /logout?next=encodedUrl
 * - /logout&next=encodedUrl
 * - /logout?next=url1&next=url2&next=url3 (chained services)
 *
 * @author Bus Counter Team
 * @version 1.0.0
 */

(function (global) {
  "use strict";

  const LogoutHandler = {
    /**
     * Storage Types
     */
    STORAGE_TYPES: {
      LOCAL_STORAGE: "localStorage",
      SESSION_STORAGE: "sessionStorage",
      COOKIE: "cookie",
      ALL: "all",
      CUSTOM: "custom",
    },

    /**
     * Default Configuration
     */
    config: {
      // URL สำหรับ redirect เมื่อไม่มี next parameter
      defaultRedirectUrl: "http://localhost:3001/login",

      // Storage type: 'localStorage', 'sessionStorage', 'cookie', 'all', 'custom'
      storageType: "localStorage",

      // Keys สำหรับ localStorage
      localStorageKeys: [],

      // Keys สำหรับ sessionStorage
      sessionStorageKeys: [],

      // Cookie names ที่ต้องการลบ
      cookieNames: [],

      // Cookie options สำหรับการลบ
      cookieOptions: {
        path: "/",
        domain: null, // null = current domain
        secure: false,
        sameSite: "Lax",
      },

      // Clear all items ใน storage (ไม่ระบุ keys)
      clearAllLocalStorage: false,
      clearAllSessionStorage: false,
      clearAllCookies: false,

      // Delay ก่อน redirect (milliseconds)
      redirectDelay: 500,

      // Custom clear function สำหรับ storage อื่นๆ
      // function(): Promise<void> | void
      customClearFn: null,

      // Callback functions
      onLogoutStart: null, // function()
      onLogoutComplete: null, // function()
      onRedirect: null, // function(url)
      onError: null, // function(error)

      // Debug mode
      debug: false,
    },

    /**
     * Log message if debug mode is enabled
     */
    log(...args) {
      if (this.config.debug) {
        console.log("[LogoutHandler]", ...args);
      }
    },

    /**
     * Initialize with custom config
     * @param {Object} customConfig
     * @returns {LogoutHandler}
     */
    init(customConfig = {}) {
      // Deep merge for nested objects
      this.config = {
        ...this.config,
        ...customConfig,
        cookieOptions: {
          ...this.config.cookieOptions,
          ...(customConfig.cookieOptions || {}),
        },
      };

      this.log("Initialized with config:", this.config);
      return this;
    },

    /**
     * Reset config to default
     * @returns {LogoutHandler}
     */
    reset() {
      this.config = {
        defaultRedirectUrl: "http://localhost:3001/login",
        storageType: "localStorage",
        localStorageKeys: [],
        sessionStorageKeys: [],
        cookieNames: [],
        cookieOptions: {
          path: "/",
          domain: null,
          secure: false,
          sameSite: "Lax",
        },
        clearAllLocalStorage: false,
        clearAllSessionStorage: false,
        clearAllCookies: false,
        redirectDelay: 500,
        customClearFn: null,
        onLogoutStart: null,
        onLogoutComplete: null,
        onRedirect: null,
        onError: null,
        debug: false,
      };
      return this;
    },

    // ============================================
    // Storage Clear Methods
    // ============================================

    /**
     * Clear localStorage
     */
    clearLocalStorage() {
      if (typeof localStorage === "undefined") {
        this.log("localStorage is not available");
        return;
      }

      if (this.config.clearAllLocalStorage) {
        localStorage.clear();
        this.log("Cleared all localStorage");
      } else if (this.config.localStorageKeys.length > 0) {
        this.config.localStorageKeys.forEach((key) => {
          localStorage.removeItem(key);
          this.log("Removed localStorage key:", key);
        });
      }
    },

    /**
     * Clear sessionStorage
     */
    clearSessionStorage() {
      if (typeof sessionStorage === "undefined") {
        this.log("sessionStorage is not available");
        return;
      }

      if (this.config.clearAllSessionStorage) {
        sessionStorage.clear();
        this.log("Cleared all sessionStorage");
      } else if (this.config.sessionStorageKeys.length > 0) {
        this.config.sessionStorageKeys.forEach((key) => {
          sessionStorage.removeItem(key);
          this.log("Removed sessionStorage key:", key);
        });
      }
    },

    /**
     * Delete a single cookie
     * @param {string} name
     * @param {Object} options
     */
    deleteCookie(name, options = {}) {
      const opts = { ...this.config.cookieOptions, ...options };

      let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      if (opts.path) {
        cookieString += `; path=${opts.path}`;
      }

      if (opts.domain) {
        cookieString += `; domain=${opts.domain}`;
      }

      if (opts.secure) {
        cookieString += "; secure";
      }

      if (opts.sameSite) {
        cookieString += `; samesite=${opts.sameSite}`;
      }

      document.cookie = cookieString;
      this.log("Deleted cookie:", name);
    },

    /**
     * Get all cookie names
     * @returns {string[]}
     */
    getAllCookieNames() {
      return document.cookie
        .split(";")
        .map((cookie) => cookie.trim().split("=")[0])
        .filter((name) => name);
    },

    /**
     * Clear cookies
     */
    clearCookies() {
      if (typeof document === "undefined") {
        this.log("document is not available");
        return;
      }

      if (this.config.clearAllCookies) {
        const allCookies = this.getAllCookieNames();
        allCookies.forEach((name) => {
          this.deleteCookie(name);
        });
        this.log("Cleared all cookies");
      } else if (this.config.cookieNames.length > 0) {
        this.config.cookieNames.forEach((name) => {
          this.deleteCookie(name);
        });
      }
    },

    /**
     * Clear all authentication data based on storage type
     */
    async clearAuthData() {
      if (this.config.onLogoutStart) {
        this.config.onLogoutStart();
      }

      const storageType = this.config.storageType;

      switch (storageType) {
        case this.STORAGE_TYPES.LOCAL_STORAGE:
          this.clearLocalStorage();
          break;

        case this.STORAGE_TYPES.SESSION_STORAGE:
          this.clearSessionStorage();
          break;

        case this.STORAGE_TYPES.COOKIE:
          this.clearCookies();
          break;

        case this.STORAGE_TYPES.ALL:
          this.clearLocalStorage();
          this.clearSessionStorage();
          this.clearCookies();
          break;

        case this.STORAGE_TYPES.CUSTOM:
          if (this.config.customClearFn) {
            await Promise.resolve(this.config.customClearFn());
            this.log("Executed custom clear function");
          }
          break;

        default:
          this.log("Unknown storage type:", storageType);
      }

      // Also run custom function if provided (even when not CUSTOM type)
      if (
        storageType !== this.STORAGE_TYPES.CUSTOM &&
        this.config.customClearFn
      ) {
        await Promise.resolve(this.config.customClearFn());
        this.log("Executed additional custom clear function");
      }

      if (this.config.onLogoutComplete) {
        this.config.onLogoutComplete();
      }

      this.log("Auth data cleared");
    },

    // ============================================
    // URL Parsing Methods
    // ============================================

    /**
     * Parse URL and extract next parameter
     * @returns {string|null}
     */
    getNextUrl() {
      const currentUrl = window.location.href;

      try {
        const urlObj = new URL(currentUrl);

        // Method 1: Standard query parameter
        let nextUrl = urlObj.searchParams.get("next");

        // Method 2: Handle &next= format
        if (!nextUrl) {
          const pathAndQuery = currentUrl.split("logout")[1];
          if (pathAndQuery) {
            const nextMatch = pathAndQuery.match(/[?&]next=([^&]*)/);
            if (nextMatch && nextMatch[1]) {
              nextUrl = nextMatch[1];
            }
          }
        }

        const result = nextUrl ? decodeURIComponent(nextUrl) : null;
        this.log("Next URL:", result);
        return result;
      } catch (error) {
        this.log("Error parsing URL:", error);
        return null;
      }
    },

    /**
     * Get remaining next parameters
     * @returns {string}
     */
    getRemainingNextParams() {
      const currentUrl = window.location.href;
      const remainingMatch = currentUrl.match(/[?&]next=[^&]*(&next=.*)$/);

      if (remainingMatch && remainingMatch[1]) {
        const result = remainingMatch[1].substring(1);
        this.log("Remaining params:", result);
        return result;
      }

      return "";
    },

    /**
     * Build final redirect URL
     * @param {string} nextUrl
     * @returns {string}
     */
    buildRedirectUrl(nextUrl) {
      const remainingParams = this.getRemainingNextParams();

      if (!remainingParams) {
        return nextUrl;
      }

      const separator = nextUrl.includes("?") ? "&" : "?";
      const finalUrl = `${nextUrl}${separator}${remainingParams}`;

      this.log("Final redirect URL:", finalUrl);
      return finalUrl;
    },

    // ============================================
    // Redirect Methods
    // ============================================

    /**
     * Redirect to URL
     * @param {string} url
     */
    redirect(url) {
      if (this.config.onRedirect) {
        this.config.onRedirect(url);
      }

      this.log("Redirecting to:", url);

      setTimeout(() => {
        window.location.href = url;
      }, this.config.redirectDelay);
    },

    /**
     * Redirect to default login
     */
    redirectToDefault() {
      this.redirect(this.config.defaultRedirectUrl);
    },

    // ============================================
    // Main Execute Method
    // ============================================

    /**
     * Execute full logout flow
     */
    async execute() {
      try {
        // Step 1: Clear auth data
        await this.clearAuthData();

        // Step 2: Get next URL
        const nextUrl = this.getNextUrl();

        // Step 3: Redirect
        if (nextUrl) {
          const finalUrl = this.buildRedirectUrl(nextUrl);
          this.redirect(finalUrl);
        } else {
          this.redirectToDefault();
        }
      } catch (error) {
        console.error("[LogoutHandler] Error:", error);

        if (this.config.onError) {
          this.config.onError(error);
        }

        this.redirectToDefault();
      }
    },
  };

  // ============================================
  // Export
  // ============================================

  // CommonJS
  if (typeof module !== "undefined" && module.exports) {
    module.exports = LogoutHandler;
  }

  // AMD
  if (typeof define === "function" && define.amd) {
    define([], function () {
      return LogoutHandler;
    });
  }

  // Browser global
  global.LogoutHandler = LogoutHandler;
})(typeof window !== "undefined" ? window : this);
