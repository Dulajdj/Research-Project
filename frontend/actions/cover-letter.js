// frontend/actions/cover-letter.js
// Helper functions used by server components and client components on the
// frontend. They proxy requests to the backend Express API.

// backend base URL; override with NEXT_PUBLIC_API_URL when available
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error || res.statusText || 'Unknown error';
    throw new Error(msg);
  }
  return data;
}

export async function getCoverLetters() {
  return fetchJSON('/api/cover-letter');
}

export async function getCoverLetter(id) {
  if (!id) return null;
  return fetchJSON(`/api/cover-letter?id=${id}`);
}

export async function saveCoverLetter(id, content) {
  const body = id ? { id, content } : { content };
  return fetchJSON('/api/cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function deleteCoverLetter(id) {
  return fetchJSON(`/api/cover-letter?id=${id}`, { method: 'DELETE' });
}

export async function generateCoverLetter(formData) {
  return fetchJSON('/api/generate-cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}
