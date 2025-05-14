const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('Server is running, https://github.com/vuthanhtrung2010/visitor-counter/');
});

app.get('/:username/count.svg', async (req, res) => {
  const { username } = req.params;

  const counter = await prisma.counter.upsert({
    where: { username },
    update: { count: { increment: 1 } },
    create: { username, count: 1 },
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
      <text x="${x + cellW/2}" y="${cellH*0.7}"
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
