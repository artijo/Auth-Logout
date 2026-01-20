# Universal Logout Handler v1.0.0

🚪 ไลบรารี JavaScript สำหรับจัดการ Logout และลบข้อมูล Authentication จากหลายแหล่งเก็บข้อมูล

## ✨ Features

- ✅ รองรับ **localStorage**, **sessionStorage**, และ **Cookies**
- ✅ รองรับ Custom Storage (เช่น IndexedDB, Memory Store)
- ✅ รองรับ Chained Logout สำหรับหลาย Services
- ✅ รองรับ Callback Functions
- ✅ Debug Mode สำหรับการพัฒนา
- ✅ ไม่มี Dependencies
- ✅ รองรับ CommonJS, AMD, และ Browser Global

---

## 📦 Installation

### วิธีที่ 1: ใช้งานผ่าน Script Tag

```html
<script src="script.js"></script>
```

### วิธีที่ 2: CommonJS (Node.js)

```javascript
const LogoutHandler = require("./script.js");
```

### วิธีที่ 3: AMD

```javascript
require(["script"], function (LogoutHandler) {
  // ใช้งาน LogoutHandler
});
```

---

## 🚀 Quick Start

### การใช้งานพื้นฐาน

```javascript
// Initialize และ Execute
LogoutHandler.init({
  localStorageKeys: ["token", "user", "refreshToken"],
  defaultRedirectUrl: "https://example.com/login",
}).execute();
```

### รูปแบบ URL ที่รองรับ

```
# Standard query parameter
https://example.com/logout?next=https%3A%2F%2Fapp.example.com

# Alternative format
https://example.com/logout&next=https%3A%2F%2Fapp.example.com

# Chained services (หลาย services)
https://example.com/logout?next=https%3A%2F%2Fservice1.com%2Flogout&next=https%3A%2F%2Fservice2.com
```

---

## ⚙️ Configuration Options

### ตัวเลือกทั้งหมด

```javascript
LogoutHandler.init({
  // URL สำหรับ redirect เมื่อไม่มี next parameter
  defaultRedirectUrl: "http://localhost:3001/login",

  // ประเภท Storage: 'localStorage', 'sessionStorage', 'cookie', 'all', 'custom'
  storageType: "localStorage",

  // Keys สำหรับ localStorage ที่ต้องการลบ
  localStorageKeys: ["token", "user", "refreshToken"],

  // Keys สำหรับ sessionStorage ที่ต้องการลบ
  sessionStorageKeys: ["sessionId", "tempData"],

  // Cookie names ที่ต้องการลบ
  cookieNames: ["auth_token", "session_id"],

  // Cookie options สำหรับการลบ
  cookieOptions: {
    path: "/",
    domain: null, // null = current domain
    secure: false,
    sameSite: "Lax",
  },

  // Clear ทุก items ใน storage
  clearAllLocalStorage: false,
  clearAllSessionStorage: false,
  clearAllCookies: false,

  // Delay ก่อน redirect (milliseconds)
  redirectDelay: 500,

  // Custom clear function สำหรับ storage อื่นๆ
  customClearFn: null,

  // Callback functions
  onLogoutStart: null,
  onLogoutComplete: null,
  onRedirect: null,
  onError: null,

  // Debug mode
  debug: false,
});
```

---

## 📖 Usage Examples

### 1. ลบเฉพาะ localStorage

```javascript
LogoutHandler.init({
  storageType: "localStorage",
  localStorageKeys: ["token", "user", "refreshToken"],
  defaultRedirectUrl: "/login",
}).execute();
```

### 2. ลบเฉพาะ sessionStorage

```javascript
LogoutHandler.init({
  storageType: "sessionStorage",
  sessionStorageKeys: ["sessionId", "tempData"],
  defaultRedirectUrl: "/login",
}).execute();
```

### 3. ลบเฉพาะ Cookies

```javascript
LogoutHandler.init({
  storageType: "cookie",
  cookieNames: ["auth_token", "session_id", "remember_me"],
  cookieOptions: {
    path: "/",
    domain: ".example.com",
  },
  defaultRedirectUrl: "/login",
}).execute();
```

### 4. ลบทุก Storage Types

```javascript
LogoutHandler.init({
  storageType: "all",
  localStorageKeys: ["token", "user"],
  sessionStorageKeys: ["sessionId"],
  cookieNames: ["auth_token"],
  defaultRedirectUrl: "/login",
}).execute();
```

### 5. ลบทุกอย่างใน Storage

```javascript
LogoutHandler.init({
  storageType: "all",
  clearAllLocalStorage: true,
  clearAllSessionStorage: true,
  clearAllCookies: true,
  defaultRedirectUrl: "/login",
}).execute();
```

### 6. ใช้ Custom Clear Function

```javascript
LogoutHandler.init({
  storageType: "custom",
  customClearFn: async () => {
    // ลบข้อมูลจาก IndexedDB
    const db = await openDatabase();
    await db.clear("auth");

    // ลบข้อมูลจาก Memory Store
    MyApp.authStore.clear();

    // เรียก API logout
    await fetch("/api/logout", { method: "POST" });
  },
  defaultRedirectUrl: "/login",
}).execute();
```

### 7. ใช้ร่วมกับ Callbacks

```javascript
LogoutHandler.init({
  localStorageKeys: ["token", "user"],
  defaultRedirectUrl: "/login",
  debug: true,

  onLogoutStart: () => {
    console.log("เริ่มกระบวนการ Logout...");
    // แสดง Loading
    showLoadingSpinner();
  },

  onLogoutComplete: () => {
    console.log("ลบข้อมูลเสร็จสิ้น");
    // ส่ง Analytics
    analytics.track("user_logged_out");
  },

  onRedirect: (url) => {
    console.log("กำลัง Redirect ไป:", url);
  },

  onError: (error) => {
    console.error("เกิดข้อผิดพลาด:", error);
    // แสดง Error Message
    showErrorMessage("Logout ล้มเหลว");
  },
}).execute();
```

---

## 🔗 Chained Logout (Multi-Service)

สำหรับระบบที่มีหลาย Services และต้องการ Logout จากทุก Services:

### Service A (Main Service)

```javascript
// URL: https://service-a.com/logout?next=https%3A%2F%2Fservice-b.com%2Flogout&next=https%3A%2F%2Fservice-c.com%2Flogin

LogoutHandler.init({
  localStorageKeys: ["token_a"],
  // ไม่ต้องกำหนด defaultRedirectUrl เพราะจะใช้ next parameter
}).execute();

// จะ redirect ไป: https://service-b.com/logout?next=https%3A%2F%2Fservice-c.com%2Flogin
```

### Service B

```javascript
// URL: https://service-b.com/logout?next=https%3A%2F%2Fservice-c.com%2Flogin

LogoutHandler.init({
  localStorageKeys: ["token_b"],
}).execute();

// จะ redirect ไป: https://service-c.com/login
```

---

## 🛠️ API Reference

### Methods

| Method                        | Description                      | Returns          |
| ----------------------------- | -------------------------------- | ---------------- |
| `init(config)`                | Initialize ด้วย custom config    | `LogoutHandler`  |
| `reset()`                     | Reset config กลับเป็นค่า default | `LogoutHandler`  |
| `execute()`                   | Execute logout flow ทั้งหมด      | `Promise<void>`  |
| `clearAuthData()`             | ลบข้อมูล auth ตาม config         | `Promise<void>`  |
| `clearLocalStorage()`         | ลบ localStorage                  | `void`           |
| `clearSessionStorage()`       | ลบ sessionStorage                | `void`           |
| `clearCookies()`              | ลบ cookies                       | `void`           |
| `deleteCookie(name, options)` | ลบ cookie เฉพาะตัว               | `void`           |
| `getNextUrl()`                | ดึง next URL จาก query params    | `string \| null` |
| `redirect(url)`               | Redirect ไปยัง URL               | `void`           |
| `redirectToDefault()`         | Redirect ไปยัง default URL       | `void`           |

### Storage Types

| Type             | Description                  |
| ---------------- | ---------------------------- |
| `localStorage`   | ลบเฉพาะ localStorage         |
| `sessionStorage` | ลบเฉพาะ sessionStorage       |
| `cookie`         | ลบเฉพาะ Cookies              |
| `all`            | ลบทุก storage types          |
| `custom`         | ใช้ custom function เท่านั้น |

---

## 🔧 Advanced Usage

### ใช้งานแบบ Manual (ไม่ Auto Execute)

```javascript
// Initialize
LogoutHandler.init({
  localStorageKeys: ["token"],
  debug: true,
});

// ลบข้อมูลก่อน
await LogoutHandler.clearAuthData();

// ทำอย่างอื่นก่อน redirect
await sendAnalytics();
await notifyBackend();

// Redirect เอง
const nextUrl = LogoutHandler.getNextUrl();
if (nextUrl) {
  LogoutHandler.redirect(nextUrl);
} else {
  LogoutHandler.redirectToDefault();
}
```

### รวมกับ IndexedDB

```javascript
LogoutHandler.init({
  storageType: "all",
  clearAllLocalStorage: true,
  clearAllSessionStorage: true,
  clearAllCookies: true,

  customClearFn: async () => {
    // ลบ IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase("MyAppDB");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
}).execute();
```

### ใช้กับ Framework (React Example)

```jsx
import { useEffect } from "react";

function LogoutPage() {
  useEffect(() => {
    // ต้อง import script.js ก่อน
    window.LogoutHandler.init({
      localStorageKeys: ["token", "user"],
      defaultRedirectUrl: "/login",
      onLogoutStart: () => {
        console.log("Logging out...");
      },
    }).execute();
  }, []);

  return (
    <div className="logout-page">
      <h1>กำลังออกจากระบบ...</h1>
      <p>กรุณารอสักครู่</p>
    </div>
  );
}

export default LogoutPage;
```

---

## 🐛 Debug Mode

เปิด Debug Mode เพื่อดู Log ใน Console:

```javascript
LogoutHandler.init({
  debug: true,
  localStorageKeys: ["token"],
}).execute();
```

Output ตัวอย่าง:

```
[LogoutHandler] Initialized with config: {...}
[LogoutHandler] Removed localStorage key: token
[LogoutHandler] Auth data cleared
[LogoutHandler] Next URL: https://example.com/dashboard
[LogoutHandler] Redirecting to: https://example.com/dashboard
```

---

## 📋 HTML Example

สร้างหน้า Logout แบบง่าย:

```html
<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Logout</title>
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        font-family: sans-serif;
        background: #f5f5f5;
      }
      .logout-container {
        text-align: center;
        padding: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div class="logout-container">
      <div class="spinner"></div>
      <h2>กำลังออกจากระบบ...</h2>
      <p>กรุณารอสักครู่</p>
    </div>

    <script src="script.js"></script>
    <script>
      LogoutHandler.init({
        storageType: "all",
        localStorageKeys: ["token", "user", "refreshToken"],
        sessionStorageKeys: ["sessionId"],
        cookieNames: ["auth_token"],
        defaultRedirectUrl: "/login",
        redirectDelay: 1000,
        debug: true,
      }).execute();
    </script>
  </body>
</html>
```

---

## 🤝 Contributing

Pull requests are welcome! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue ก่อนเพื่อพูดคุยเกี่ยวกับสิ่งที่คุณต้องการเปลี่ยนแปลง

---

## 📄 License

MIT License

---

## 👥 Author

**Bus Counter Team**

---

## 📝 Changelog

### v1.0.0

- 🎉 Initial release
- ✅ รองรับ localStorage, sessionStorage, cookies
- ✅ รองรับ Chained logout
- ✅ รองรับ Custom clear function
- ✅ รองรับ Callback functions
- ✅ Debug mode
