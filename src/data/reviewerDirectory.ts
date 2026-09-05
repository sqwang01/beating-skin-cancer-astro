/**
 * Plain-text identity for every medical editorial board member: slug, display
 * name (with post-nominals), and a short specialty label.
 *
 * This module is intentionally free of asset imports so it can be loaded from a
 * plain Node context (the build-time checklist-PDF generator in
 * `integrations/checklist-pdfs.mjs`) as well as from Astro components.
 *
 * The rich board data — credentials, affiliation, bio, headshot, JSON-LD
 * specialties — lives in `src/data/editorialBoard.ts`. Keep the `slug` and
 * `name` values here in sync with that file; `name` must match exactly.
 */

export interface ReviewerIdentity {
  /** URL-safe id; matches the anchor on /editorial-board and the byline slug. */
  slug: string;
  /** Full name with post-nominals, e.g. "Steven Q. Wang, MD". */
  name: string;
  /** Short specialty label for the PDF footer byline, e.g. "Dermatology". */
  specialtyShort: string;
}

export const DEFAULT_REVIEWER_SLUG = 'steven-wang-md';

export const reviewerDirectory: ReviewerIdentity[] = [
  { slug: 'steven-wang-md', name: 'Steven Q. Wang, MD', specialtyShort: 'Dermatology' },
  { slug: 'stephen-dusza-drph', name: 'Stephen W. Dusza, Dr.P.H.', specialtyShort: 'Biostatistics and Epidemiology' },
  { slug: 'laura-ferris-md', name: 'Laura K. Ferris, M.D., Ph.D.', specialtyShort: 'Dermatology' },
  { slug: 'yaser-homsi-md', name: 'Yaser Homsi, MD', specialtyShort: 'Medical Oncology' },
  { slug: 'vernon-sondak-md', name: 'Vernon K. Sondak, MD', specialtyShort: 'Surgical Oncology' },
  { slug: 'david-swanson-md', name: 'David L. Swanson, MD', specialtyShort: 'Dermatology' },
  { slug: 'thomas-wang-md', name: 'Thomas N. Wang, MD, PhD', specialtyShort: 'Surgical Oncology' },
];

/** Look up a reviewer by slug. Returns `undefined` for an unknown slug so
 *  callers (and the checklist validator) can treat that as an error. */
export function getReviewerIdentity(
  slug: string = DEFAULT_REVIEWER_SLUG,
): ReviewerIdentity | undefined {
  return reviewerDirectory.find((r) => r.slug === slug);
}
