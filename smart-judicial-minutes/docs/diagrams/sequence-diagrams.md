# Sequence Diagrams

## 1. Start documentation → live transcription

```mermaid
sequenceDiagram
  actor Clerk
  participant Tab as Client (Teams tab)
  participant API as API server
  participant Entra
  participant Speech as Azure Speech
  participant SQL as Azure SQL

  Clerk->>Tab: بدء التوثيق
  Tab->>Entra: getAuthToken() (SSO)
  Entra-->>Tab: access token
  Tab->>API: POST /api/sessions (Bearer)
  API->>Entra: validate token (JWKS)
  API->>SQL: INSERT session
  API-->>Tab: session
  Tab->>API: GET /api/speech/token
  API->>Speech: issueToken (key, retry+breaker)
  Speech-->>API: STS token
  API-->>Tab: STS token
  Tab->>Speech: open WSS, stream mic audio
  loop while speaking
    Speech-->>Tab: transcribing/transcribed (ar-SA)
    Tab-->>Clerk: live text (speaker+role+time)
    Tab->>API: POST segments (every ~4s, batched)
    API->>SQL: MERGE segments (id+sessionId)
  end
```

## 2. Reconnect after a transient Speech disconnect

```mermaid
sequenceDiagram
  participant Tab as Client
  participant Speech as Azure Speech
  Note over Tab,Speech: network glitch
  Speech-->>Tab: canceled
  Tab-->>Tab: onReconnecting → show banner
  Tab->>Tab: backoff (exponential)
  Tab->>Speech: rebuild transcriber (fresh token)
  Speech-->>Tab: transcribing resumes
  Tab-->>Tab: onReconnected → hide banner
  Note over Tab: transcript preserved (server + local backup)
```

## 3. Stop → save recording

```mermaid
sequenceDiagram
  actor Clerk
  participant Tab as Client
  participant API as API server
  participant Blob as Azure Blob
  participant SQL as Azure SQL

  Clerk->>Tab: إيقاف التوثيق
  Tab->>Tab: flush pending segments
  Tab->>API: POST recording (audio bytes)
  API->>Blob: upload (retry) → <tenant>/<session>/recording.ext
  API->>SQL: UPDATE session.recordingBlobName
  Tab->>API: POST /sessions/:id/stop
  API->>SQL: UPDATE status=stopped
  API-->>Tab: stopped session
```

## 4. Export transcript

```mermaid
sequenceDiagram
  actor Clerk
  participant Tab as Client
  participant API as API server
  participant SQL as Azure SQL
  Clerk->>Tab: تصدير PDF/DOCX/TXT
  Tab->>API: GET /sessions/:id/export?format=...
  API->>SQL: SELECT session + segments
  API->>API: render (RTL, metadata, escaped)
  API-->>Tab: file (attachment) + audit.export
  Tab-->>Clerk: download
```

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
