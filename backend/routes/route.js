import { handleCheckResumePOST, handleParseResumePOST, handleGenerateCoverLetterPOST, handleGenerateSummaryPOST, handleResumeGET, handleResumePOST, handleResumePUT, handleResumeDELETE } from '../apiHandlers.js';
// This route file mirrors the Next.js catch-all API structure from the
// original project. It isn't wired into the Express server by default,
// and uses the same helpers as apiHandlers.js. You may refactor or delete
// it depending on how you intend to expose the API from the backend.

export async function POST(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  console.log('[api catch-all] POST', pathname);

  if (pathname.startsWith('/api/check-resume')) {
    return handleCheckResumePOST(req);
  }

  if (pathname.startsWith('/api/parse-resume')) {
    return handleParseResumePOST(req);
  }

  if (pathname.startsWith('/api/generate-cover-letter')) {
    return handleGenerateCoverLetterPOST(req);
  }

  if (pathname.startsWith('/api/generate-summary')) {
    return handleGenerateSummaryPOST(req);
  }

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumePOST(req);
  }

  // fallback for unknown POST paths when using this catch-all route
  return { status: 404, body: { error: 'POST route not found', path: pathname } }; // Express callers can convert this to res.status(404).json(...) if desired
}

export async function GET(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumeGET(req);
  }

  return { status: 404, body: { error: 'GET route not found' } }; 

}

export async function PUT(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumePUT(req);
  }

  return { status: 404, body: { error: 'PUT route not found' } }; 

}

export async function DELETE(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumeDELETE(req);
  }

  return { status: 404, body: { error: 'DELETE route not found' } }; 
}