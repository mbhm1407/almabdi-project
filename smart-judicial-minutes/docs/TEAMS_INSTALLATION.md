# Teams Installation Guide

How to package, sideload and publish the app in Microsoft Teams.

## 1. Fill the manifest placeholders

`teams-app/appPackage/manifest.json` uses `${{...}}` tokens. Replace or inject:

| Token | Value |
|---|---|
| `TEAMS_APP_ID` | A GUID for this app (generate once) |
| `APP_DOMAIN` | HTTPS host serving the client (no scheme) |
| `ENTRA_API_CLIENT_ID` | The Entra API app registration client id |

The `webApplicationInfo.resource` must match the Application ID URI
`api://<APP_DOMAIN>/<ENTRA_API_CLIENT_ID>`.

## 2. Validate & build the package

```bash
node scripts/validate-manifest.mjs      # checks required fields + icons + SSO + side panel
node scripts/package-teams-app.mjs      # -> teams-app/appPackage.zip
```

## 3. Sideload for testing

Teams → **Apps → Manage your apps → Upload an app → Upload a custom app** →
select `teams-app/appPackage.zip`.

## 4. Add to a meeting

1. Open a meeting → **+ (Add an app)** → choose **المحضر الذكي**.
2. Complete the configuration screen and press **Save** (pins the app to the
   meeting side panel).
3. During the hearing, open the side panel and press **بدء التوثيق**.

## 5. What the manifest declares

- `configurableTabs.context` includes **meetingSidePanel** (and meeting chat /
  details tabs).
- `webApplicationInfo` enables **Teams SSO** (single sign-on).
- `devicePermissions: ["media"]` — microphone access for live transcription.
- `validDomains` — the app domain.

## 6. Publish (organization-wide)

For tenant-wide rollout, submit `appPackage.zip` to the **Teams admin center →
Teams apps → Manage apps → Upload**, then approve and set org permission
policies. Coordinate with the Microsoft 365 / Teams administrator.

## 7. First-run consent

The first user (or an admin, org-wide) consents to the `access_as_user` scope.
After consent, SSO issues tokens silently.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
