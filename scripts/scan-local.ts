const target = process.argv[2] ?? 'https://example.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const response = await fetch(`${apiUrl}/scans/free`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: target }),
});

console.log(JSON.stringify(await response.json(), null, 2));

