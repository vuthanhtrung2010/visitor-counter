import express from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import pkg from 'ip';
const { cidrSubnet } = pkg;

const app = express();
const prisma = new PrismaClient();

// List of trusted proxy CIDRs (Cloudflare + loopback)
const trustedProxies = [
  '127.0.0.1/8',          // IPv4 loopback
  '::1/128',              // IPv6 loopback

  // Cloudflare IPv4 ranges
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',

  // Cloudflare IPv6 ranges
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32'
];

app.set('trust proxy', (ip) => {
  return trustedProxies.some(cidr => {
    try {
      return cidrSubnet(cidr).contains(ip);
    } catch (e) {
      return false;
    }
  });
});

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

app.get('/', (req, res) => {
  res.send('Server is running, https://github.com/vuthanhtrung2010/visitor-counter/');
});

app.get('/:username/:platform/count.svg', async (req, res) => {
  const { username, platform } = req.params;

  console.log("req.ip:", req.ip);
  console.log("cf-connecting-ip:", req.headers['cf-connecting-ip']);
  console.log("x-forwarded-for:", req.headers['x-forwarded-for']);

  const counter = await prisma.counter.upsert({
    where: { username_platform: { username, platform } },
    update: { count: { increment: 1 } },
    create: { username, platform, count: 1 },
  });

  const digits = String(counter.count).split('');
  const cellW = 20;
  const cellH = 30;
  const padding = 2;
  const totalW = digits.length * (cellW + padding);
  const totalH = cellH;

  const cells = digits.map((d, i) => {
    const x = i * (cellW + padding);
    return `
      <rect x="${x}" y="0" width="${cellW}" height="${cellH}" rx="4" ry="4" fill="#000"/>
      <text x="${x + cellW / 2}" y="${cellH * 0.7}"
            font-family="monospace" font-size="20"
            text-anchor="middle" fill="#0f0">
        ${d}
      </text>
    `;
  }).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${totalW}" height="${totalH}">
      ${cells}
    </svg>`.trim();

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(svg);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);