# Assignment 4 — Automation Testing API & UI (Cypress + Selenium IDE)

Repository ini berisi automation testing untuk aplikasi **Script Labs**:

| Bagian | Target | Tools | Lokasi |
|---|---|---|---|
| 1. API Testing (GET, POST, PUT, DELETE) | https://api-script-labs.hendri.me/api-docs/ | Cypress | [`cypress/e2e/api/`](cypress/e2e/api/) |
| 2. UI Testing | https://labs.hendri.me/ | Selenium IDE | [`selenium-ide/script-labs-ui.side`](selenium-ide/script-labs-ui.side) |
| 3. ⭐ UI Testing (nilai plus) | https://labs.hendri.me/ | Cypress | [`cypress/e2e/ui/`](cypress/e2e/ui/) |

Kedua website sudah dicek dapat diakses (HTTP 200) sebelum test dibuat.

## Struktur Project

```
.
├── cypress
│   ├── e2e
│   │   ├── api
│   │   │   └── labs-api.cy.js        # API test: health, auth, CRUD labs
│   │   └── ui
│   │       ├── login.cy.js           # UI test: login valid/invalid/locked, logout
│   │       ├── shop-checkout.cy.js   # UI test: search, filter, cart, checkout
│   │       └── script-crud.cy.js     # UI test: create, edit, delete script
│   ├── fixtures
│   │   └── users.json                # Data akun demo
│   └── support
│       ├── commands.js               # Custom command: apiLogin, apiRequest, uiLogin
│       ├── constants.js              # Base URL API
│       └── e2e.js
├── docs
│   └── screenshots                   # Bukti hasil eksekusi test
├── selenium-ide
│   └── script-labs-ui.side           # Project Selenium IDE (UI test)
├── cypress.config.js
└── package.json
```

## Cara Menjalankan

### Prasyarat
- Node.js 18+ (dicoba dengan Node.js 22)
- Google Chrome (untuk Selenium IDE)

### Cypress

```bash
npm install

npm run cy:open     # mode interaktif (Cypress App)
npm test            # jalankan semua test (API + UI) secara headless
npm run test:api    # hanya API test
npm run test:ui     # hanya UI test
```

> **Catatan (Windows + terminal VS Code):** jika muncul error `Cypress.exe: bad option: --smoke-test`,
> hapus environment variable `ELECTRON_RUN_AS_NODE` terlebih dahulu
> (PowerShell: `Remove-Item Env:ELECTRON_RUN_AS_NODE`), lalu jalankan ulang.

### Selenium IDE

1. Install extension [Selenium IDE](https://www.selenium.dev/selenium-ide/) di Chrome/Firefox.
2. Buka Selenium IDE → **Open an existing project** → pilih `selenium-ide/script-labs-ui.side`.
3. Pilih suite **Script Labs UI Suite** → klik **Run all tests in suite**.

Alternatif lewat command line:

```bash
npx selenium-side-runner selenium-ide/script-labs-ui.side
```

## Skenario Test

### 1. API Testing — Cypress (`labs-api.cy.js`)

| # | Method | Endpoint | Skenario | Expected |
|---|---|---|---|---|
| 1 | GET | `/health` | Cek server berjalan | 200, `Server is healthy` |
| 2 | POST | `/api/auth/login` | Login akun valid | 200, mendapat JWT token |
| 3 | POST | `/api/auth/login` | Password salah | 401, `AUTH_FAILED` |
| 4 | POST | `/api/auth/login` | Akun terkunci | 403, `USER_LOCKED` |
| 5 | GET | `/api/auth/me` | Data user yang login | 200, email sesuai |
| 6 | GET | `/api/labs` | Tanpa token | 401, `No token provided` |
| 7 | POST | `/api/labs` | Membuat lab baru | 201, data sesuai payload |
| 8 | POST | `/api/labs` | Title & description kosong | 400, pesan validasi |
| 9 | GET | `/api/labs?page=1&limit=5` | List lab + pagination | 200, maksimal 5 data |
| 10 | GET | `/api/labs?search=` | Cari lab yang baru dibuat | 200, lab ditemukan |
| 11 | GET | `/api/labs/{id}` | Detail lab | 200, data sesuai |
| 12 | PUT | `/api/labs/{id}` | Update title & description | 200, data ter-update |
| 13 | DELETE | `/api/labs/{id}` | Hapus lab | 200, `lab deleted successfully` |
| 14 | GET | `/api/labs/{id}` | Lab yang sudah dihapus | 404, `lab not found` |

Alur CRUD saling berurutan: token dari login dipakai untuk POST, lalu `id` hasil POST dipakai untuk GET, PUT, dan DELETE. Data test selalu dihapus kembali di akhir.

### 2. UI Testing — Selenium IDE (`script-labs-ui.side`)

| Test Case | Langkah Utama |
|---|---|
| TC01 - Login dengan akun valid | Login `standard_user` → verifikasi `Hello, ...` → logout |
| TC02 - Login dengan password salah | Verifikasi pesan `Invalid email or password` |
| TC03 - Search dan filter produk | Search "Cypress" → filter kategori "API Testing" |
| TC04 - Add to cart dan checkout | Add 2 produk → ubah quantity → remove → isi form → checkout sukses |
| TC05 - Script CRUD | Create script → search → edit → delete lewat modal konfirmasi |

### 3. ⭐ UI Testing — Cypress (`cypress/e2e/ui/`)

| File | Skenario |
|---|---|
| `login.cy.js` | Halaman dapat diakses, login valid, password salah, akun terkunci, logout |
| `shop-checkout.cy.js` | 6 produk tampil, search, filter kategori, add/quantity/remove cart + total harga, checkout sukses, validasi field wajib |
| `script-crud.cy.js` | Tombol Add disabled saat form kosong, create, update, delete (dengan modal konfirmasi), verifikasi request API via `cy.intercept` |

## Hasil Eksekusi

**Cypress** — `npm test`

```
  ✔  api/labs-api.cy.js        14 passing
  ✔  ui/login.cy.js             5 passing
  ✔  ui/script-crud.cy.js       4 passing
  ✔  ui/shop-checkout.cy.js     6 passing
  ✔  All specs passed!         29 passing
```

**Selenium IDE** — `selenium-side-runner` (Chrome headless)

```
  √ TC01 - Login dengan akun valid
  √ TC02 - Login dengan password salah
  √ TC03 - Search dan filter produk
  √ TC04 - Add to cart dan checkout
  √ TC05 - Script CRUD (create, edit, delete)
  Tests: 5 passed, 5 total
```

### Screenshot

**1. API Testing — Cypress (`labs-api.cy.js`, 14 passing)**

![Cypress API test](docs/screenshots/cypress-api.png)

**2. UI Testing — Selenium IDE (TC01–TC05 passed)**

![Selenium IDE](docs/screenshots/selenium-ide.png)

**3. ⭐ UI Testing — Cypress**

`login.cy.js` (5 passing)

![Cypress UI login](docs/screenshots/cypress-ui-login.png)

`shop-checkout.cy.js` (6 passing)

![Cypress UI shop checkout](docs/screenshots/cypress-ui-shop-checkout.png)

`script-crud.cy.js` (4 passing)

![Cypress UI script CRUD](docs/screenshots/cypress-ui-script-crud.png)

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Standard User | `standard_user@example.com` | `script_sauce` |
| Locked User | `locked_user@example.com` | `script_sauce` |
