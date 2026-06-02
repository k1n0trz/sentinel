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

## GET /scans/:id

Returns a previously saved in-memory scan result.

## GET /reports/:scanId

Returns a structured report summary for a scan.
