import {getServerEnv} from './src/env.mjs';
import type { NextConfig } from "next";

const configEnv=getServerEnv();
const demoAuth = configEnv.VERCEL !== '1' && configEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.startsWith('demo-') && configEnv.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL === 'http://127.0.0.1:9099';
const isDev = configEnv.NODE_ENV !== "production";

// CSP: Next injeta scripts inline na hidratação, por isso 'unsafe-inline' em script-src.
// Migrar para nonce por requisição (middleware) é o próximo endurecimento.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://i.ytimg.com",
  `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.firebaseio.com${demoAuth ? ' http://127.0.0.1:9099' : ''}`,
  "frame-src 'self' https://*.firebaseapp.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
  ...(isDev || demoAuth ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingExcludes: { "/*": ["./bibliografia-pdfs/**", "./work/**", "./public/**/*.webp", "./public/**/*.png", "./public/**/*.jpg", "./public/**/*.jpeg", "./node_modules/@napi-rs/canvas/**", "./node_modules/@napi-rs/canvas-*/**"] },
  poweredByHeader: false,

  async redirects() {
    return [{source:"/sitemap-index.xml",destination:"/sitemap.xml",statusCode:301},...Array.from({length:5},(_,i)=>({source:`/questoes/enem-2011-d2-q09${i+1}`,destination:`https://gabaru.com.br/questoes/enem-2011-d2-q09${i+1}-en`,statusCode:301})),{
      source: "/:path*",
      has: [{ type: "host", value: "www\\.gabaru\\.com\\.br" }],
      destination: "https://gabaru.com.br/:path*",
      statusCode: 301,
    }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }, ...["etec", "coluni"].map(institution => ({ source: `/acervo/${institution}/:edition/:file`, headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Content-Security-Policy", value: csp.replace("frame-ancestors 'none'", "frame-ancestors 'self'") }] })), { source: "/api/v1/vestibulares/:institution/:document", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Content-Security-Policy", value: csp.replace("frame-ancestors 'none'", "frame-ancestors 'self'") }] }];
  },
};

export default nextConfig;
