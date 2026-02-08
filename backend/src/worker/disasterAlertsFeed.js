const crypto = require('crypto');
const Parser = require('rss-parser');
const cron = require('node-cron');
const { prisma } = require('../lib/prisma');

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'DisasterAlert-Backend/1.0' },
});

function dedupeHash(title, publishedAt, source) {
  const str = [String(title || ''), String(publishedAt || ''), String(source || '')].join('|');
  return crypto.createHash('sha256').update(str).digest('hex');
}

function normalizeDate(value) {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function fetchAsJson(url) {
  const protocol = url.startsWith('https') ? require('https') : require('http');
  return new Promise((resolve, reject) => {
    const req = protocol.get(url, { timeout: 15000, headers: { 'User-Agent': 'DisasterAlert-Backend/1.0' } }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function normalizeJsonItems(raw) {
  const items = Array.isArray(raw) ? raw : (raw && raw.items) ? raw.items : (raw && raw.feed) ? raw.feed : [];
  return items.map((it) => ({
    title: it.title || it.name || 'Untitled',
    description: it.description || it.content || it.summary || null,
    type: it.type || it.category || 'GENERAL',
    severity: it.severity || it.level || 'UNKNOWN',
    source: it.source || it.origin || null,
    publishedAt: normalizeDate(it.publishedAt || it.pubDate || it.published || it.date || it.created),
  }));
}

async function parseFeed(feedUrl, feedType) {
  const type = (feedType || 'rss').toLowerCase();
  if (type === 'json') {
    const raw = await fetchAsJson(feedUrl);
    return { items: normalizeJsonItems(raw), sourceLabel: feedUrl };
  }
  const feed = await parser.parseURL(feedUrl);
  const sourceLabel = feed.title || feedUrl;
  const items = (feed.items || []).map((it) => ({
    title: it.title || 'Untitled',
    description: it.contentSnippet || it.content || it.summary || null,
    type: it.categories?.[0] || 'GENERAL',
    severity: 'UNKNOWN',
    source: sourceLabel,
    publishedAt: normalizeDate(it.pubDate || it.isoDate),
  }));
  return { items, sourceLabel };
}

async function runFetch() {
  const feedUrl = process.env.DISASTER_ALERTS_FEED_URL;
  const feedType = process.env.DISASTER_ALERTS_FEED_TYPE || 'rss';

  if (!feedUrl || !feedUrl.trim()) {
    return;
  }

  const url = feedUrl.trim();
  let items;
  let sourceLabel;

  try {
    const parsed = await parseFeed(url, feedType);
    items = parsed.items;
    sourceLabel = parsed.sourceLabel;
  } catch (err) {
    console.error('[DisasterAlertsFeed] Fetch/parse error:', err.message);
    return;
  }

  let created = 0;
  for (const it of items) {
    const publishedAt = it.publishedAt instanceof Date ? it.publishedAt : new Date(it.publishedAt);
    const source = it.source || sourceLabel || url;
    const hash = dedupeHash(it.title, publishedAt.toISOString(), source);

    try {
      const existing = await prisma.disasterAlert.findUnique({
        where: { dedupeHash: hash },
      });
      if (existing) continue;

      await prisma.disasterAlert.create({
        data: {
          title: it.title,
          description: it.description ?? null,
          type: String(it.type).slice(0, 100) || 'GENERAL',
          severity: String(it.severity).slice(0, 50) || 'UNKNOWN',
          source: source || null,
          publishedAt,
          dedupeHash: hash,
        },
      });
      created += 1;
    } catch (err) {
      if (err.code === 'P2002') continue;
      console.error('[DisasterAlertsFeed] Insert error:', err.message);
    }
  }

  if (created > 0) {
    console.log(`[DisasterAlertsFeed] Ingested ${created} new alert(s)`);
  }
}

let scheduled = null;

function start() {
  if (process.env.CRON_DISABLED === '1' || process.env.DISASTER_ALERTS_CRON_DISABLED === '1') {
    return;
  }
  const feedUrl = process.env.DISASTER_ALERTS_FEED_URL;
  if (!feedUrl || !feedUrl.trim()) {
    return;
  }
  const schedule = process.env.DISASTER_ALERTS_CRON_SCHEDULE || '*/15 * * * *';
  if (!cron.validate(schedule)) {
    console.warn('[DisasterAlertsFeed] Invalid DISASTER_ALERTS_CRON_SCHEDULE, using */15 * * * *');
  }
  const cronExpr = cron.validate(schedule) ? schedule : '*/15 * * * *';
  scheduled = cron.schedule(cronExpr, () => {
    runFetch().catch((err) => {
      console.error('[DisasterAlertsFeed] Job error:', err);
    });
  });
  console.log('[DisasterAlertsFeed] Cron scheduled:', cronExpr);
  runFetch().catch((err) => console.error('[DisasterAlertsFeed] Initial run error:', err));
}

function stop() {
  if (scheduled) {
    scheduled.stop();
    scheduled = null;
  }
}

module.exports = {
  start,
  stop,
  runFetch,
};
