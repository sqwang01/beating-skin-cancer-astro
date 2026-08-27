import {
  DEFAULT_REVIEWER_SLUG,
  getBoardMember,
  type BoardMember,
} from '../data/editorialBoard';

const SITE = 'https://www.beatingskincancer.com';

/** Physician node for a board member, for use inside an Organization `member` array. */
export function physicianJsonLd(member: BoardMember) {
  return {
    '@type': 'Physician',
    name: member.name,
    url: `${SITE}/editorial-board#${member.slug}`,
    jobTitle: member.role,
    medicalSpecialty: member.medicalSpecialty,
    ...(member.alumniOf
      ? {
          alumniOf: member.alumniOf.map((name) => ({
            '@type': 'CollegeOrUniversity',
            name,
          })),
        }
      : {}),
    ...(member.sameAs ? { sameAs: member.sameAs } : {}),
  };
}

/**
 * MedicalWebPage review block. `reviewerSlug` defaults to the Editor-in-Chief;
 * pass a slug from `src/data/editorialBoard.ts` to attribute the review to
 * another board member.
 */
export function medicalReviewJsonLd(
  url: string,
  lastReviewed: string,
  reviewerSlug: string = DEFAULT_REVIEWER_SLUG,
) {
  const reviewer = getBoardMember(reviewerSlug);
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url,
    reviewedBy: {
      '@type': 'Physician',
      name: reviewer.name,
      url: `${SITE}/editorial-board#${reviewer.slug}`,
    },
    lastReviewed,
  };
}
