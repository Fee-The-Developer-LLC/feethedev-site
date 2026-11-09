/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com" "https://checkout.stripe.com")',
  },
  // allow-popups: Stripe checkout opens 3-D Secure and Link windows.
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Client portal uploads go through server actions (25 MB per upload).
    serverActions: { bodySizeLimit: '26mb' },
  },
  async redirects() {
    return [
      {
        source: '/services/payments-integration',
        destination: '/services/payments-and-back-end-integration',
        permanent: true,
      },
      { source: '/merch', destination: '/services', permanent: true },
    ];
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
