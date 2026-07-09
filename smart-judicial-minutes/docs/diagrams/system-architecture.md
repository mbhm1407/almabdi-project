# System Architecture Diagram

```mermaid
flowchart TB
  subgraph Teams["Microsoft Teams (meeting side panel)"]
    Tab["Client SPA\nReact + Fluent UI v9 (RTL)"]
  end

  subgraph Azure["Azure"]
    Speech["Azure AI Speech\n(ar-SA, Conversation Transcription)"]
    Entra["Microsoft Entra ID\n(SSO / JWKS)"]
    SQL[("Azure SQL\nSessions / Segments /\nBookmarks / Audit")]
    Blob[("Azure Blob Storage\nRecordings")]
    Monitor["Azure Monitor /\nApp Insights"]
  end

  API["API Server\nExpress + TypeScript"]

  Tab -- "Teams SSO token" --> Entra
  Tab -- "1. GET /api/speech/token (Bearer)" --> API
  API -- "validate token (JWKS)" --> Entra
  API -- "issue STS token" --> Speech
  API -- "STS token" --> Tab
  Tab -- "2. mic audio (WSS, direct)" --> Speech
  Speech -- "transcribing/transcribed" --> Tab
  Tab -- "3. POST segments (batched)" --> API
  Tab -- "4. POST recording (on stop)" --> API
  Tab -- "5. GET export / search / bookmarks" --> API
  API -- "parameterized SQL" --> SQL
  API -- "upload / SAS" --> Blob
  API -- "structured logs (reqId)" --> Monitor
```

## Notes

- The **Speech subscription key never reaches the browser**; the client uses a
  short-lived STS token to talk to Azure Speech directly.
- The API validates every request's Entra token and enforces tenant-scoped RBAC.
- The client is stateless static hosting; the API is a stateless container.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
