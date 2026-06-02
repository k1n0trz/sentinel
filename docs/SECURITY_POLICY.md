# Sentinel Security Policy

Sentinel is a defensive security product. It must operate under explicit authorization, low impact defaults, and clear scan scope boundaries.

## Mandatory Rules

- Only run deep scans against domains verified by the user.
- Keep the public free scan passive or low impact.
- Do not implement brute force.
- Do not implement destructive exploitation.
- Do not extract, store, or reveal sensitive data.
- Do not evade security systems.
- Do not allow aggressive tests against third-party domains.
- Design domain ownership verification before advanced modules.
- Document authorized use clearly.
- Apply rate limiting from the start.

## MVP Safe Mode

The MVP may inspect:

- Headers
- SSL certificate metadata
- DNS basics
- Redirects
- Public HTTP status

The MVP must not:

- Send exploit payloads
- Attempt authentication bypass
- Attempt login
- Enumerate private data
- Stress or fuzz targets

## Domain Verification

Future advanced scans should require one of:

- DNS TXT token
- HTTP well-known token
- Uploaded verification file
- Platform integration proof

