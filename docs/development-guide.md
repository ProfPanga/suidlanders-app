# Development Guide - Suidlanders Emergency Plan App

## Prerequisites

### Required Software
- **Node.js**: v18+ (recommended: v20 LTS)
- **npm**: v9+ (comes with Node.js)
- **Angular CLI**: v19.2.13 (installed globally or via npx)
- **Ionic CLI**: Latest (installed globally recommended)
- **Android Studio**: Required for Android builds (includes Android SDK)
- **Java Development Kit (JDK)**: 17 or 21 (for Android builds)

### Platform-Specific Requirements

**For Android Development:**
- Android Studio with Android SDK 33+
- Gradle 8.x (comes with Android Studio)
- Android emulator or physical device with USB debugging enabled

**For iOS Development (optional):**
- macOS required
- Xcode 14+
- CocoaPods
- iOS Simulator or physical device

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd suidlanders-app
```

### 2. Install Dependencies
```bash
npm install
```

**Note:** This installs 890+ packages including Angular, Ionic, Capacitor, and all dependencies.

### 3. Environment Configuration

**Development Environment:**
- File: `src/environments/environment.ts`
- API URL: `http://localhost:3000/api` (default NestJS port)

**Production Environment:**
- File: `src/environments/environment.prod.ts`
- API URL: `/api` (relative, served from same domain)

**Custom Configuration:**
Create a `.env` file (not tracked) for local overrides if needed.

---

## Development Commands

### Start Development Server
```bash
npm start
# or
ionic serve
```

**Access:** http://localhost:8100 (default Ionic port)

**Features:**
- Live reload on file changes
- Browser DevTools support
- Platform emulation (desktop, iOS, Android)

---

### Build for Production
```bash
npm run build
```

**Output:** `www/browser/` (Angular) → needs flattening for Capacitor

**Build Configurations:**
- **Development:** `ng build --configuration=development`
- **Production:** `ng build --configuration=production` (default)
- **CI:** `ng build --configuration=ci` (no progress output)

**Production Optimizations:**
- Tree-shaking and dead code elimination
- AOT (Ahead-of-Time) compilation
- Minification and bundling
- Source maps (optional)

---

### Android Build Process

#### Build Android Debug APK
```bash
npm run buildAndroid
```

**This script performs:**
1. Builds Angular app: `ionic build`
2. Flattens output: `mv www/browser/* www/ && rmdir www/browser`
3. Syncs with Capacitor: `npx cap sync android`
4. Builds APK: `cd android && ./gradlew clean assembleDebug`

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

#### Manual Steps (for debugging)
```bash
# 1. Build web app
ionic build

# 2. Flatten www folder (Capacitor requirement)
mv www/browser/* www/
rmdir www/browser

# 3. Sync Capacitor
npx cap sync android

# 4. Open in Android Studio (optional)
npx cap open android

# 5. Build APK via Gradle
cd android
./gradlew clean assembleDebug
```

---

### Asset Generation

#### Generate Android Assets
```bash
npm run assets:generate
```

**Source:** `resources/icon.png` (1024x1024 recommended)

**Generated:**
- Launcher icons: `android/app/src/main/res/mipmap-*`
- Splash screens: `android/app/src/main/res/drawable-*`
- Adaptive icons: `mipmap-anydpi-v26`

#### Generate All Platform Assets
```bash
npm run assets:generate:all
```

Generates for both Android and iOS.

---

### Testing

#### Run Unit Tests
```bash
npm test
```

**Framework:** Jasmine + Karma
**Configuration:** `karma.conf.js`
**Test Files:** `*.spec.ts` files alongside components/services

**Watch Mode:** Tests run on file changes (default)

#### Run Tests Once (CI Mode)
```bash
npm test -- --watch=false --configuration=ci
```

#### Code Coverage
Tests generate coverage reports in `coverage/` directory.

---

### Linting

#### Run Linter
```bash
npm run lint
```

**Configuration:** `.eslintrc.json`
**Rules:**
- Angular ESLint rules
- TypeScript-specific rules
- Import/export validation

**Auto-fix:**
```bash
npm run lint -- --fix
```

---

## Platform-Specific Workflows

### Testing on Android Device

#### Via USB Debugging
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run: `npx cap run android`

#### Via Android Emulator
1. Start emulator in Android Studio
2. Run: `npx cap run android`
3. App installs and launches automatically

---

### Testing on Web/Desktop

#### Browser Testing
```bash
ionic serve
```

**Platform Emulation:**
- Chrome DevTools → Device Toolbar
- Test as mobile/tablet/desktop

**Database:** Uses IndexedDB (Dexie) instead of SQLite

#### Desktop Mode Testing
```bash
ionic serve --lab
```

Opens Ionic Lab with side-by-side platform previews.

---

## Database Development

### Migrations
Database migrations handled automatically by `DatabaseService`:
- Schema version tracked in `members.version` column
- Migration logic in `DatabaseService.handleMigrations()`
- Increment `currentVersion` in DatabaseService for schema changes

### Testing Database
Route: `/db-test`

**Features:**
- Test SQLite/IndexedDB connection
- Run CRUD operations
- Verify data encryption
- Check migration logic

### Viewing Data
Route: `/data-viewer`

**Features:**
- List all members
- View full member records
- Search/filter
- Export data

---

## Debugging

### Browser DevTools (Web)
- **Console:** View logs and errors
- **Network:** Monitor API calls
- **Application → Storage:** Inspect IndexedDB
- **Sources:** Set breakpoints in TypeScript

### Android Debugging

#### Logcat (Android Studio)
```bash
# Via ADB
adb logcat | grep -i capacitor
```

#### Chrome DevTools for WebView
1. Connect Android device via USB
2. Open Chrome: `chrome://inspect`
3. Select your app's WebView
4. Full DevTools available

---

## Common Development Tasks

### Add New Form Section Component
```bash
ionic generate component components/sections/new-section --standalone
```

**Then:**
1. Implement `ControlValueAccessor`
2. Create database table migration
3. Add to `MemberFormComponent`
4. Update `form-sections.interface.ts`

### Add New Service
```bash
ionic generate service services/new-service
```

**Pattern:** Injectable singleton (`providedIn: 'root'`)

### Add New Page
```bash
ionic generate page pages/new-page
```

**Then:** Add route in `app.routes.ts` (or routing module)

---

## Build Troubleshooting

### Issue: "www/browser not found"
**Cause:** Angular outputs to `www/browser/` but Capacitor expects `www/`

**Solution:** Use `npm run buildAndroid` script (auto-flattens)

### Issue: Gradle Build Fails
**Solutions:**
1. Clean build: `cd android && ./gradlew clean`
2. Stop Gradle daemon: `./gradlew --stop`
3. Invalidate caches: Android Studio → File → Invalidate Caches

### Issue: Database Not Initializing
**Check:**
1. Platform detection: `platform.is('android')` vs `platform.is('desktop')`
2. SQLite plugin installed: Check `capacitor.config.ts`
3. Fallback to IndexedDB triggered

---

## Environment Variables

### Development (.env - not tracked)
```env
API_URL=http://localhost:3000/api
ENCRYPTION_KEY=your-dev-key
```

### Production
Configure in `src/environments/environment.prod.ts`

**Security Note:** Never commit production secrets to repository.

---

## Capacitor Sync

### When to Run `cap sync`
Run after:
- Installing/updating Capacitor plugins
- Changing `capacitor.config.ts`
- Building web app for native platform
- Modifying native resources

```bash
npx cap sync
# or platform-specific
npx cap sync android
npx cap sync ios
```

---

## Testing Routes (QA/Debug)

| Route | Purpose |
|-------|---------|
| `/home` | Main member registration form |
| `/login` | Staff/admin authentication |
| `/db-test` | Database CRUD testing |
| `/data-viewer` | Inspect stored data |
| `/qr-test` | QR generation/scanning verification |

---

## Performance Optimization

### Build Size Optimization
- **Lazy Loading:** Pages loaded on-demand
- **Tree-shaking:** Unused code removed in production
- **Budget Limits:** Configured in `angular.json`
  - Initial: 5MB max (warning at 2MB)
  - Component styles: 4KB max (warning at 2KB)

### Runtime Optimization
- **OnPush Change Detection:** Used in performance-critical components
- **Virtual Scrolling:** For long lists (if implemented)
- **IndexedDB Batching:** Batch writes for better performance

---

## Code Style Guidelines

### TypeScript
- **Strict Mode:** Enabled (`tsconfig.json`)
- **Naming:**
  - Classes: PascalCase
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Interfaces: Prefix with `I` (optional)

### Angular Conventions
- **Components:** Suffix with `Component`
- **Services:** Suffix with `Service`
- **Guards:** Suffix with `Guard`
- **Standalone:** All components/pages use standalone pattern

### Ionic UI
- Use Ionic components (ion-*) for native feel
- Follow mobile-first design principles
- Test on actual devices, not just desktop browsers

---

## Deployment

### Android Deployment

#### Debug APK (Testing)
```bash
npm run buildAndroid
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (Play Store)
```bash
cd android
./gradlew assembleRelease
```

**Requires:**
- Signing keystore configured
- `release` build variant in `build.gradle`

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Web Deployment
1. Build: `npm run build`
2. Deploy `www/` folder to web server
3. Configure backend API URL in environment

---

## CI/CD Notes

**Current Status:** No CI/CD configured

**Recommended Setup:**
- GitHub Actions or GitLab CI
- Automated testing on push
- Build APK for releases
- Deploy web build to staging/production

---

## Notes

- **Database:** Dual-mode (SQLite for mobile, IndexedDB for web)
- **Offline-First:** All features work without network
- **Language:** UI in Afrikaans, code comments in English
- **TypeScript:** Strict mode enforced for type safety
- **Testing:** Unit tests with Jasmine/Karma (routes for manual QA)
- **No CI/CD:** Manual builds and deployments
