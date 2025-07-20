import { eq, and } from "drizzle-orm";
import * as schema from "~/database/schema";
import type { Route } from "./+types/counter";

function generateCounterSvg(count: number): string {
  const digits = String(count).split('');
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

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${totalW}" height="${totalH}">
      ${cells}
    </svg>`.trim();
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { username, platform } = params;

  if (!username || !platform) {
    throw new Response('Invalid path', { status: 400 });
  }

  console.log("request.headers CF-Connecting-IP:", request.headers.get('CF-Connecting-IP'));
  console.log("request.headers X-Forwarded-For:", request.headers.get('X-Forwarded-For'));

  try {
    // Try to find existing counter
    const existingCounter = await context.db
      .select()
      .from(schema.counter)
      .where(and(
        eq(schema.counter.username, username),
        eq(schema.counter.platform, platform)
      ))
      .get();

    let count: number;

    if (existingCounter) {
      // Update existing counter
      const updated = await context.db
        .update(schema.counter)
        .set({ count: existingCounter.count + 1 })
        .where(and(
          eq(schema.counter.username, username),
          eq(schema.counter.platform, platform)
        ))
        .returning({ count: schema.counter.count })
        .get();
      
      count = updated?.count || existingCounter.count + 1;
    } else {
      // Create new counter
      const created = await context.db
        .insert(schema.counter)
        .values({ username, platform, count: 1 })
        .returning({ count: schema.counter.count })
        .get();
      
      count = created?.count || 1;
    }

    const svg = generateCounterSvg(count);

    // Return SVG response
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
}
