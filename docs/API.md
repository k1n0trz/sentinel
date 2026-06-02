# Sentinel API

Base URL in development: `http://localhost:4100`

## GET /health

Returns service health.

```json
{
  "ok": true,
  "service": "sentinel-api",
  "timestamp": "2026-06-02T00:00:00.000Z"
}
```

## POST /scans/free

Runs a passive, low-impact scan.

Request:

```json
{
  "url": "https://example.com"
}
```

Response:

```json
{
  "id": "scan-id",
  "targetUrl": "https://example.com/",
  "finalUrl": "https://example.com/",
  "status": "completed",
  "httpStatus": 200,
  "https": true,
  "score": 80,
  "riskLevel": "Good",
  "headers": [],
  "ssl": {
    "enabled": true
  },
  "dns": {
    "hostname": "example.com",
    "addresses": ["93.184.216.34"],
    "mx": [],
    "ns": []
  },
  "findings": [],
  "createdAt": "2026-06-02T00:00:00.000Z"
}
```

## POST /public/scans

Runs the public demo scan intended for `sentinelcloud.dev`.

This endpoint is passive or low impact only. It is safe for the public demo and must not run deep checks without domain verification.

Request:

```json
{
  "url": "https://example.com",
  "followRedirects": true,
  "hideFromPublicResults": false
}
```

Response includes the normal scan payload plus:

```json
{
  "grade": "A",
  "metadata": {
    "responseTimeMs": 420,
    "redirectChain": [
      {
        "from": "http://example.com/",
        "to": "https://example.com/",
        "status": 301
      }
    ],
    "robotsTxt": {
      "url": "https://example.com/robots.txt",
      "present": true,
      "status": 200
    },
    "sitemapXml": {
      "url": "https://example.com/sitemap.xml",
      "present": true,
      "status": 200
    }
  }
}
```

Security header entries include richer analysis:

```json
{
  "name": "Content-Security-Policy",
  "present": true,
  "status": "weak",
  "severity": "medium",
  "value": "default-src * 'unsafe-inline'",
  "risk": "Content-Security-Policy is present but allows unsafe-inline, uses wildcard sources.",
  "recommendation": "Tighten CSP with explicit source lists, start with Report-Only if needed, and remove unsafe-inline/unsafe-eval wherever possible."
}
```

Header statuses:

- `present`
- `missing`
- `weak`
- `misconfigured`

Grades:

- `A+`, `A`, `B`, `C`, `D`, `E`, `F`
- `R` when the target could not be reached

## GET /public/scans/:id

Returns a public scan by id. The API reads from PostgreSQL when configured and falls back to in-memory storage during local development.

## GET /public/reports/:scanId

Returns a structured public report summary for the demo. Public reports are available by direct id only; Sentinel does not expose public scan listings.

## GET /scans/:id

Returns a saved scan result. The API reads from PostgreSQL when configured and falls back to in-memory storage during local development.

## GET /reports/:scanId

Returns a structured report summary for a scan.
