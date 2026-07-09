# UI/UX Mockups — المحضر الذكي (Smart Judicial Minutes)

High-fidelity mockups of the application, reconstructed **directly from the
implemented React components** under `packages/client/src/features/transcript/`.
Every screen uses the real values from the codebase — nothing here invents UI
that the app does not render:

- **Brand ramp:** the Ministry-of-Justice green ramp from
  `packages/client/src/theme/brand.ts` (`#217C46` shade 80, header
  `colorBrandBackground2` = `#E5F2E8` light / `#0A1E12` dark).
- **Theme tokens:** Fluent UI v9 `createLightTheme` / `createDarkTheme` neutral
  tokens (with the dark brand-foreground override from `theme/themes.ts`).
- **Copy:** the exact Arabic strings from `packages/client/src/strings.ts` and
  the judicial role labels from `packages/shared/src/types/roles.ts`.
- **Layout:** the structure of `MeetingHeader`, `TranscriptToolbar`,
  `SegmentRow`, `OpeningScreen`, `AboutDialog`, `StatisticsPanel`,
  `RecordingsPanel`, `BookmarksPanel`, `ExportMenu` and `SearchBar`.
- **Direction:** RTL Arabic, Microsoft Teams meeting side-panel context.
- **Content:** a realistic commercial hearing (case `٤٣٥/٢/ق`, الدائرة
  التجارية الثالثة) — no lorem ipsum.

All images are **3840×2160** (1920×1080 at 2× device scale). Fonts: Noto Sans
Arabic (a faithful stand-in for "Segoe UI Web (Arabic)") + Noto Color Emoji.

## Gallery

Open [`gallery.html`](./gallery.html) to preview every screen on one page.

## Screens

| File | Screen | Reflects |
|------|--------|----------|
| `01-opening-screen.png` | شاشة الافتتاح · Opening Screen | `OpeningScreen.tsx` — emblem, case/circuit/judge/clerk fields, read-only Hijri date & time, large **بدء التوثيق** button, footer credit |
| `02-live-documentation.png` | التوثيق المباشر · Live Documentation | Active hearing: header (current speaker, timer, live badge), toolbar, live transcript with an interim (in-progress) line, auto-save indicator |
| `03-transcript-view.png` | عرض النص · Transcript View | Long transcript, speaker names + judicial roles + timestamps, search term «الأعمال» highlighted with `3/4` match navigation |
| `04-recording-management.png` | إدارة التسجيل · Recording Management | `RecordingsPanel.tsx` — duration, size, audio playback, **تنزيل التسجيل** |
| `05-export.png` | التصدير · Export | `ExportMenu.tsx` — PDF · Word · نصّي (TXT) menu (print also lives in the toolbar) |
| `06-statistics-dashboard.png` | إحصائيات الجلسة · Statistics | `StatisticsPanel.tsx` — duration, speakers, words, phrases, last update tiles + connection/speech status badges |
| `07-about-dialog.png` | حول التطبيق · About | `AboutDialog.tsx` — المحضر الذكي, وزارة العدل, version **1.0.0**, developer **محمد المعبدي**, **mbmaabdi@moj.gov.sa** |
| `08-teams-meeting-view.png` | داخل اجتماع Teams · Teams Meeting View | The app in the meeting side panel as a Court Clerk sees it, alongside the courtroom stage |
| `09-dark-mode.png` | الوضع الليلي · Dark Mode | The dark Ministry-green theme (Teams dark host) |
| `10-light-mode.png` | الوضع النهاري · Light Mode | The default light theme, reading state |
| `11-mobile-responsive.png` | العرض على الجوال · Mobile Responsive | Teams mobile — single-column, wrapped header & toolbar |
| `12-narrow-side-panel.png` | اللوحة الجانبية الضيقة · Narrow Side Panel | Narrow panel — header and toolbar wrap, transcript reflows |
| `13-bookmarks.png` | العلامات المرجعية · Bookmarks | `BookmarksPanel.tsx` — add / jump / delete judicial bookmarks |
| `14-reconnecting-state.png` | موثوقية الاتصال · Auto-Reconnect | The reconnect `MessageBar` — automatic reconnection without transcript loss |

## Regenerating

```bash
cd packages/client
node ../../docs/mockups/build/render.mjs
```

The generator lives in [`build/`](./build): `design.mjs` (theme tokens +
component CSS), `icons.mjs` (Fluent-style inline SVGs), `render.mjs` (screen
composition + Chromium screenshot + gallery). Source HTML is written to
`html/`.

---
صُمّم وطُوّر بواسطة محمد المعبدي · mbmaabdi@moj.gov.sa
