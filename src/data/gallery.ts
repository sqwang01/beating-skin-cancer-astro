import type { ImageMetadata } from 'astro';

import scc01Clinical from '../images/gallery/squamous-cell-carcinoma/scc-01-clinical.jpg';
import scc01Dermoscopy from '../images/gallery/squamous-cell-carcinoma/scc-01-dermoscopy.jpg';
import scc02Clinical from '../images/gallery/squamous-cell-carcinoma/scc-02-clinical.jpg';
import scc02Dermoscopy from '../images/gallery/squamous-cell-carcinoma/scc-02-dermoscopy.jpg';
import scc03Clinical from '../images/gallery/squamous-cell-carcinoma/scc-03-clinical.jpg';
import scc03Dermoscopy from '../images/gallery/squamous-cell-carcinoma/scc-03-dermoscopy.jpg';
import scc04Clinical from '../images/gallery/squamous-cell-carcinoma/scc-04-clinical.jpg';
import scc04Dermoscopy from '../images/gallery/squamous-cell-carcinoma/scc-04-dermoscopy.jpg';
import scc05Clinical from '../images/gallery/squamous-cell-carcinoma/scc-05-clinical.jpg';
import scc05Dermoscopy from '../images/gallery/squamous-cell-carcinoma/scc-05-dermoscopy.jpg';
import scc06Clinical from '../images/gallery/squamous-cell-carcinoma/scc-06-clinical.jpg';
import scc06Dermoscopy from '../images/gallery/squamous-cell-carcinoma/scc-06-dermoscopy.jpg';

export type GalleryCategory =
  | 'squamous-cell-carcinoma'
  | 'basal-cell-carcinoma'
  | 'melanoma'
  | 'atypical-nevi';

export interface GalleryCaseImage {
  image: ImageMetadata;
  alt: string;
}

export interface GalleryCase {
  id: string;
  category: GalleryCategory;
  diagnosis: string;
  /** Biopsy-confirmed diagnosis, as opposed to a clinical impression only. */
  biopsyProven: boolean;
  site?: string;
  subtype?: string;
  phototype?: string;
  /** Free-text clinical description written for this specific lesion. */
  description?: string;
  /** Treatment performed for this specific lesion. */
  treatment?: string;
  consentStatus: string;
  credit: string;
  clinical: GalleryCaseImage;
  dermoscopy: GalleryCaseImage;
}

export const galleryCategoryMeta: Record<
  GalleryCategory,
  { label: string; path: string }
> = {
  'squamous-cell-carcinoma': { label: 'Squamous Cell Carcinoma', path: '/gallery/squamous-cell-carcinoma' },
  'basal-cell-carcinoma': { label: 'Basal Cell Carcinoma', path: '/gallery/basal-cell-carcinoma' },
  melanoma: { label: 'Melanoma', path: '/gallery/melanoma' },
  'atypical-nevi': { label: 'Atypical Nevi', path: '/gallery/atypical-nevi' },
};

export const galleryCases: GalleryCase[] = [
  {
    id: 'scc-01',
    category: 'squamous-cell-carcinoma',
    diagnosis: 'Squamous cell carcinoma',
    biopsyProven: true,
    site: 'leg',
    phototype: 'II',
    consentStatus: 'verbal consent',
    credit: 'BeatingSkinCancer.com',
    clinical: { image: scc01Clinical, alt: 'Clinical photo of a biopsy-proven squamous cell carcinoma on the leg' },
    dermoscopy: { image: scc01Dermoscopy, alt: 'Dermoscopic image of the same biopsy-proven squamous cell carcinoma on the leg' },
  },
  {
    id: 'scc-02',
    category: 'squamous-cell-carcinoma',
    diagnosis: 'Squamous cell carcinoma',
    biopsyProven: true,
    site: 'leg',
    phototype: 'II',
    consentStatus: 'verbal consent',
    credit: 'BeatingSkinCancer.com',
    clinical: { image: scc02Clinical, alt: 'Clinical photo of a biopsy-proven squamous cell carcinoma on the leg' },
    dermoscopy: { image: scc02Dermoscopy, alt: 'Dermoscopic image of the same biopsy-proven squamous cell carcinoma on the leg' },
  },
  {
    id: 'scc-03',
    category: 'squamous-cell-carcinoma',
    diagnosis: 'Squamous cell carcinoma',
    biopsyProven: true,
    site: 'arm',
    phototype: 'II',
    consentStatus: 'verbal consent',
    credit: 'BeatingSkinCancer.com',
    clinical: { image: scc03Clinical, alt: 'Clinical photo of a biopsy-proven squamous cell carcinoma on the arm' },
    dermoscopy: { image: scc03Dermoscopy, alt: 'Dermoscopic image of the same biopsy-proven squamous cell carcinoma on the arm' },
  },
  {
    id: 'scc-04',
    category: 'squamous-cell-carcinoma',
    diagnosis: 'Squamous cell carcinoma',
    biopsyProven: true,
    site: 'back',
    phototype: 'III',
    consentStatus: 'verbal consent',
    credit: 'BeatingSkinCancer.com',
    clinical: { image: scc04Clinical, alt: 'Clinical photo of a biopsy-proven squamous cell carcinoma on the back' },
    dermoscopy: { image: scc04Dermoscopy, alt: 'Dermoscopic image of the same biopsy-proven squamous cell carcinoma on the back' },
  },
  {
    id: 'scc-05',
    category: 'squamous-cell-carcinoma',
    diagnosis: 'Squamous cell carcinoma',
    biopsyProven: true,
    site: 'arm',
    phototype: 'II',
    consentStatus: 'verbal consent',
    credit: 'BeatingSkinCancer.com',
    clinical: { image: scc05Clinical, alt: 'Clinical photo of a biopsy-proven squamous cell carcinoma on the arm' },
    dermoscopy: { image: scc05Dermoscopy, alt: 'Dermoscopic image of the same biopsy-proven squamous cell carcinoma on the arm' },
  },
  {
    id: 'scc-06',
    category: 'squamous-cell-carcinoma',
    diagnosis: 'Squamous cell carcinoma',
    biopsyProven: true,
    site: 'leg',
    phototype: 'II',
    consentStatus: 'verbal consent',
    credit: 'BeatingSkinCancer.com',
    clinical: { image: scc06Clinical, alt: 'Clinical photo of a biopsy-proven squamous cell carcinoma on the leg' },
    dermoscopy: { image: scc06Dermoscopy, alt: 'Dermoscopic image of the same biopsy-proven squamous cell carcinoma on the leg' },
  },
];

export function getGalleryCases(category: GalleryCategory): GalleryCase[] {
  return galleryCases.filter((c) => c.category === category);
}
