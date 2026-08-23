export function medicalReviewJsonLd(url: string, lastReviewed: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url,
    reviewedBy: {
      '@type': 'Physician',
      name: 'Steven Q. Wang, MD',
      url: 'https://www.beatingskincancer.com/about',
    },
    lastReviewed,
  };
}
