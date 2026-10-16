// Cloudflare Pages Function: same-origin proxy for /api/* to the backend.
// Strips the /api prefix, matching the old ingress rewrite (/api/(.*) -> /$1).
export const onRequest = ({ request, env }: { request: Request; env: { BACKEND_URL: string } }) => {
  const { pathname, search } = new URL(request.url)
  const target = env.BACKEND_URL.replace(/\/$/, '') + pathname.replace(/^\/api/, '') + search
  return fetch(new Request(target, request))
}
