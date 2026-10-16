// Cloudflare Pages Function: same-origin proxy for /api/* to the backend.
// The backend serves under /api/v1 itself, so the path is forwarded unchanged.
export const onRequest = ({ request, env }: { request: Request; env: { BACKEND_URL: string } }) => {
  const { pathname, search } = new URL(request.url)
  const target = env.BACKEND_URL.replace(/\/$/, '') + pathname + search
  return fetch(new Request(target, request))
}
