import { auth } from '@/auth'; // The auth handler you created

export function middleware() {
  // You may need to do additional handling here if needed
  return auth(); // Pass the request to NextAuth's handler
}
