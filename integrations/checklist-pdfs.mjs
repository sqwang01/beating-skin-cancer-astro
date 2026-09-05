/**
 * Astro integration: generate printable "questions to ask your care team"
 * checklist PDFs from `src/data/careTeamQuestions.ts` at build time.
 *
 *   - one PDF per sub-page      → /downloads/<hub>/<slug>-checklist.pdf
 *   - one combined guide per hub → /downloads/<hub>/complete-<hub>-discussion-guide.pdf
 *
 * Written to `public/downloads/` when the dev server starts and to
 * `dist/downloads/` on `astro:build:done`, so the download links are plain
 * static assets with no server cost. `public/downloads/` is git-ignored.
 *
 * The build FAILS (throws) if any checklist is missing a valid `lastReviewed`
 * or a resolvable reviewer — `assertChecklistsValid()` enforces that.
 */
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import {
  careTeamChecklists,
  hubs,
  checklistPdfPath,
  hubBundlePdfPath,
  assertChecklistsValid,
} from '../src/data/careTeamQuestions.ts';
import {
  hubChecklists,
  hubChecklistHubs,
  assertHubChecklistsValid,
} from '../src/data/hubChecklists.ts';
import {
  DEFAULT_REVIEWER_SLUG,
  getReviewerIdentity,
} from '../src/data/reviewerDirectory.ts';

// Every checklist / hub the generator knows about — the three "advanced" hubs
// (careTeamQuestions.ts) plus the non-advanced disease hubs (hubChecklists.ts).
// `checklistPdfPath` / `hubBundlePdfPath` only read `.hub` / `.slug` / the hub
// id string, so they work uniformly across both shapes.
const ALL_CHECKLISTS = [...careTeamChecklists, ...hubChecklists];
const ALL_HUBS = [...hubs, ...hubChecklistHubs];

// --- page geometry --------------------------------------------------------

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_LIMIT = MARGIN + 30;

const NAVY = rgb(0.04, 0.14, 0.26);
const INK = rgb(0.14, 0.19, 0.23);
const GREY_TEXT = rgb(0.42, 0.46, 0.5);
const GREY_LINE = rgb(0.8, 0.82, 0.84);
const SITE = 'https://www.beatingskincancer.com';

// --- masthead ----------------------------------------------------------

const WORDMARK = 'BeatingSkinCancer.com';
const HEADER_LOGO_H = 22; // pt — matches the ~48px icon in the site nav
// small pre-scaled copy of `public/Beating Cancer logo copy.png` — kept tiny so
// embedding it into ~150 PDFs at build time stays fast.
const LOGO_FILE = fileURLToPath(new URL('./assets/logo-mark.png', import.meta.url));

// --- text helpers -------------------------------------------------------

function toPlainText(s) {
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&reg;/g, '®')
    .replace(/&rsquo;|&#8217;|&#39;/g, '’')
    .replace(/&lsquo;|&#8216;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&quot;/g, '"')
    .replace(/&hellip;/g, '…')
    .replace(/ /g, ' ')
    .replace(/‑/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapLines(text, font, size, maxWidth) {
  const lines = [];
  for (const rawLine of String(text).split('\n')) {
    const words = rawLine.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines.length ? lines : [''];
}

function monthYear(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

function reviewerFor(checklist) {
  const slug = checklist.reviewer ?? DEFAULT_REVIEWER_SLUG;
  const identity = getReviewerIdentity(slug);
  if (!identity) {
    // assertChecklistsValid() should have caught this already.
    throw new Error(
      `checklist ${checklist.hub}/${checklist.slug}: unknown reviewer "${slug}"`,
    );
  }
  return identity;
}

function footerLine(checklist) {
  const r = reviewerFor(checklist);
  return `Medically reviewed by ${r.name}, ${r.specialtyShort} · Last reviewed ${monthYear(checklist.lastReviewed)}`;
}

// --- low-level PDF cursor ----------------------------------------------

function createDoc() {
  return PDFDocument.create();
}

async function makeFonts(doc) {
  return {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    oblique: await doc.embedFont(StandardFonts.HelveticaOblique),
  };
}

async function embedLogo(doc, logoBytes) {
  if (!logoBytes) return null;
  try {
    return await doc.embedPng(logoBytes);
  } catch {
    // a bad/missing logo must never block PDF generation — fall back to text only
    return null;
  }
}

function newRenderer(doc, fonts, footerText, logo = null) {
  const ctx = { doc, fonts, footerText, logo, page: null, y: 0, pageNum: 0 };
  addPage(ctx);
  return ctx;
}

function setFooter(ctx, footerText) {
  ctx.footerText = footerText;
}

function addPage(ctx) {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.pageNum += 1;
  ctx.y = PAGE_H - MARGIN;
  drawHeader(ctx);
  drawFooter(ctx);
}

function drawHeader(ctx) {
  const { page, fonts, logo } = ctx;
  const top = PAGE_H - MARGIN;
  if (logo) {
    const h = HEADER_LOGO_H;
    const w = h * (logo.width / logo.height);
    page.drawImage(logo, { x: MARGIN, y: top - h + 10, width: w, height: h });
    page.drawText(WORDMARK, {
      x: MARGIN + w + 7,
      y: top - h + 16,
      size: 11,
      font: fonts.bold,
      color: NAVY,
    });
  }
  page.drawLine({
    start: { x: MARGIN, y: top - 18 },
    end: { x: PAGE_W - MARGIN, y: top - 18 },
    thickness: 0.5,
    color: GREY_LINE,
  });
  // start body content below the masthead
  ctx.y = top - 34;
}

function drawFooter(ctx) {
  const { page, fonts } = ctx;
  page.drawLine({
    start: { x: MARGIN, y: MARGIN + 8 },
    end: { x: PAGE_W - MARGIN, y: MARGIN + 8 },
    thickness: 0.5,
    color: GREY_LINE,
  });
  if (ctx.footerText) {
    page.drawText(ctx.footerText, {
      x: MARGIN,
      y: MARGIN - 4,
      size: 7.5,
      font: fonts.regular,
      color: GREY_TEXT,
    });
  }
  page.drawText(String(ctx.pageNum), {
    x: PAGE_W - MARGIN - fonts.regular.widthOfTextAtSize(String(ctx.pageNum), 7.5),
    y: MARGIN - 4,
    size: 7.5,
    font: fonts.regular,
    color: GREY_TEXT,
  });
  page.drawText(
    'Educational use only — not a substitute for professional medical advice.',
    { x: MARGIN, y: MARGIN - 15, size: 7, font: fonts.regular, color: GREY_TEXT },
  );
}

function ensureSpace(ctx, needed) {
  if (ctx.y - needed < BOTTOM_LIMIT) addPage(ctx);
}

function drawText(ctx, text, opts = {}) {
  const {
    size = 10.5,
    font = ctx.fonts.regular,
    color = INK,
    indent = 0,
    gapAfter = 4,
    lineHeightFactor = 1.32,
  } = opts;
  const lines = wrapLines(text, font, size, CONTENT_W - indent);
  const lh = size * lineHeightFactor;
  for (const line of lines) {
    ensureSpace(ctx, lh);
    ctx.page.drawText(line, {
      x: MARGIN + indent,
      y: ctx.y - size,
      size,
      font,
      color,
    });
    ctx.y -= lh;
  }
  ctx.y -= gapAfter;
}

function drawRule(ctx, gapBefore = 0, gapAfter = 8, color = GREY_LINE) {
  ctx.y -= gapBefore;
  ensureSpace(ctx, gapAfter + 2);
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.5,
    color,
  });
  ctx.y -= gapAfter;
}

function drawAppointmentFields(ctx) {
  ensureSpace(ctx, 44);
  const top = ctx.y;
  const half = CONTENT_W / 2;
  ctx.page.drawText('Appointment date', {
    x: MARGIN,
    y: top - 8,
    size: 8,
    font: ctx.fonts.regular,
    color: GREY_TEXT,
  });
  ctx.page.drawText("Doctor's name", {
    x: MARGIN + half,
    y: top - 8,
    size: 8,
    font: ctx.fonts.regular,
    color: GREY_TEXT,
  });
  for (const x0 of [MARGIN, MARGIN + half]) {
    ctx.page.drawLine({
      start: { x: x0, y: top - 22 },
      end: { x: x0 + half - 20, y: top - 22 },
      thickness: 0.75,
      color: GREY_LINE,
    });
  }
  ctx.y = top - 38;
}

function drawChecklistItem(ctx, text) {
  const size = 10.5;
  const indent = 20;
  const lh = size * 1.34;
  const lines = wrapLines(toPlainText(text), ctx.fonts.regular, size, CONTENT_W - indent);
  // keep the checkbox with at least the first line
  ensureSpace(ctx, lh + 18);
  const top = ctx.y;
  ctx.page.drawRectangle({
    x: MARGIN,
    y: top - size,
    width: 9,
    height: 9,
    borderColor: NAVY,
    borderWidth: 1,
  });
  for (const line of lines) {
    ensureSpace(ctx, lh);
    ctx.page.drawText(line, {
      x: MARGIN + indent,
      y: ctx.y - size,
      size,
      font: ctx.fonts.regular,
      color: INK,
    });
    ctx.y -= lh;
  }
  // one ruled note line under the question
  ctx.y -= 6;
  ensureSpace(ctx, 12);
  ctx.page.drawLine({
    start: { x: MARGIN + indent, y: ctx.y },
    end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.5,
    color: GREY_LINE,
  });
  ctx.y -= 16;
}

// --- section / document composition ----------------------------------

function drawChecklistBody(ctx, checklist, { heading = true } = {}) {
  if (heading) {
    drawText(ctx, checklist.pageTitle, {
      size: 17,
      font: ctx.fonts.bold,
      color: NAVY,
      gapAfter: 3,
    });
  } else {
    drawText(ctx, checklist.pageTitle, {
      size: 14,
      font: ctx.fonts.bold,
      color: NAVY,
      gapAfter: 3,
    });
  }
  drawText(ctx, hubTitleFor(checklist), {
    size: 8.5,
    color: GREY_TEXT,
    gapAfter: 1,
  });
  drawText(ctx, `${SITE}${checklist.pagePath}`, {
    size: 8.5,
    color: GREY_TEXT,
    gapAfter: 10,
  });
  drawAppointmentFields(ctx);

  checklist.groups.forEach((group, i) => {
    if (i > 0) ctx.y -= 6;
    if (group.heading) {
      drawText(ctx, group.heading, {
        size: 11.5,
        font: ctx.fonts.bold,
        color: NAVY,
        gapAfter: group.note ? 2 : 6,
      });
    }
    if (group.note) {
      drawText(ctx, toPlainText(group.note), {
        size: 9,
        font: ctx.fonts.oblique,
        color: GREY_TEXT,
        gapAfter: 6,
      });
    }
    for (const q of group.questions) drawChecklistItem(ctx, q);
  });
}

function hubTitleFor(checklist) {
  return ALL_HUBS.find((h) => h.id === checklist.hub)?.title ?? checklist.hub;
}

async function renderChecklistPdf(checklist, logoBytes) {
  const doc = await createDoc();
  const fonts = await makeFonts(doc);
  const logo = await embedLogo(doc, logoBytes);
  doc.setTitle(`${checklist.pageTitle} — discussion checklist`);
  doc.setSubject('Questions to ask your care team');
  doc.setProducer('beatingskincancer.com');
  const ctx = newRenderer(doc, fonts, footerLine(checklist), logo);
  drawChecklistBody(ctx, checklist, { heading: true });
  return doc.save();
}

async function renderBundlePdf(hub, checklists, logoBytes) {
  const doc = await createDoc();
  const fonts = await makeFonts(doc);
  const logo = await embedLogo(doc, logoBytes);
  doc.setTitle(`${hub.title} — Complete Discussion Guide`);
  doc.setSubject('Questions to ask your care team');
  doc.setProducer('beatingskincancer.com');

  const ctx = newRenderer(doc, fonts, '', logo);

  // cover
  drawText(ctx, hub.title, { size: 22, font: fonts.bold, color: NAVY, gapAfter: 4 });
  drawText(ctx, 'Complete discussion guide', { size: 13, color: GREY_TEXT, gapAfter: 14 });
  drawText(
    ctx,
    'A printable set of questions to bring to appointments with your care team. Each section below is also available as its own one-page checklist.',
    { size: 10, color: INK, gapAfter: 12 },
  );
  drawRule(ctx, 2, 12);
  drawText(ctx, 'Sections', { size: 11, font: fonts.bold, color: NAVY, gapAfter: 6 });
  checklists.forEach((c, i) => {
    drawText(ctx, `${i + 1}.  ${c.pageTitle}`, { size: 10, color: INK, gapAfter: 3, indent: 4 });
  });
  drawText(ctx, `${SITE}${hub.path}`, { size: 8.5, color: GREY_TEXT, gapAfter: 0 });

  // one section per checklist, each starting on a fresh page with its own byline
  for (const checklist of checklists) {
    setFooter(ctx, footerLine(checklist));
    addPage(ctx);
    drawChecklistBody(ctx, checklist, { heading: false });
  }

  return doc.save();
}

// --- filesystem ------------------------------------------------------

async function writeOut(outRoot, relPath, bytes) {
  const full = path.join(outRoot, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
}

async function generateAll(outRoot, logoPath) {
  assertChecklistsValid();
  assertHubChecklistsValid();
  await rm(path.join(outRoot, 'downloads'), { recursive: true, force: true });

  let logoBytes = null;
  try {
    logoBytes = await readFile(logoPath ?? LOGO_FILE);
  } catch {
    // no masthead logo available — PDFs still get the text wordmark
  }

  const written = [];
  for (const checklist of ALL_CHECKLISTS) {
    const bytes = await renderChecklistPdf(checklist, logoBytes);
    const rel = checklistPdfPath(checklist).replace(/^\//, '');
    await writeOut(outRoot, rel, bytes);
    written.push(rel);
  }
  for (const hub of ALL_HUBS) {
    const list = ALL_CHECKLISTS.filter((c) => c.hub === hub.id).sort(
      (a, b) => a.order - b.order,
    );
    const bytes = await renderBundlePdf(hub, list, logoBytes);
    const rel = hubBundlePdfPath(hub.id).replace(/^\//, '');
    await writeOut(outRoot, rel, bytes);
    written.push(rel);
  }
  return written;
}

// --- integration --------------------------------------------------

export default function checklistPdfs() {
  let rootDir = process.cwd();

  return {
    name: 'checklist-pdfs',
    hooks: {
      'astro:config:done': ({ config }) => {
        rootDir = fileURLToPath(config.root);
      },
      'astro:server:start': async ({ logger }) => {
        const files = await generateAll(path.join(rootDir, 'public'), LOGO_FILE);
        logger.info(`generated ${files.length} checklist PDFs → public/downloads/`);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const files = await generateAll(fileURLToPath(dir), LOGO_FILE);
        logger.info(`generated ${files.length} checklist PDFs → dist/downloads/`);
      },
    },
  };
}
