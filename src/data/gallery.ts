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
  /** Optional expert caption shown in the lightbox (e.g. dermoscopy findings). */
  caption?: string;
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
    clinical: { image: scc01Clinical, alt: 'Squamous cell carcinoma (SCC) on the leg in Fitzpatrick type II skin, biopsy-proven — clinical photo of lesion 1' },
    dermoscopy: {
      image: scc01Dermoscopy,
      alt: 'Dermoscopy of a biopsy-proven squamous cell carcinoma (SCC) on the leg showing surface keratin and scale, linear-dotted vessels, and linear brown dots',
      caption:
        'Dermoscopy of the lesion shows keratin and scale on the surface, along with linear-dotted vessels and linear brown dots — patterns commonly seen in squamous cell carcinoma.',
    },
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
    clinical: { image: scc02Clinical, alt: 'Squamous cell carcinoma (SCC) on the leg in Fitzpatrick type II skin, biopsy-proven — clinical photo of lesion 2' },
    dermoscopy: {
      image: scc02Dermoscopy,
      alt: 'Dermoscopy of a biopsy-proven squamous cell carcinoma (SCC) on the leg showing linear-dotted vessels',
      caption:
        'Dermoscopy of the lesion shows linear-dotted vessels — patterns commonly seen in squamous cell carcinoma.',
    },
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
    clinical: { image: scc03Clinical, alt: 'Squamous cell carcinoma (SCC) on the arm in Fitzpatrick type II skin, biopsy-proven — clinical photo of lesion 3' },
    dermoscopy: {
      image: scc03Dermoscopy,
      alt: 'Dermoscopy of a biopsy-proven squamous cell carcinoma (SCC) on the arm showing crystalline structures and linear-dotted vessels',
      caption:
        'Dermoscopy of the lesion shows crystalline structures along with linear-dotted vessels — patterns commonly seen in squamous cell carcinoma.',
    },
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
    clinical: { image: scc04Clinical, alt: 'Squamous cell carcinoma (SCC) on the back in Fitzpatrick type III skin, biopsy-proven — clinical photo of lesion 4' },
    dermoscopy: {
      image: scc04Dermoscopy,
      alt: 'Dermoscopy of a biopsy-proven squamous cell carcinoma (SCC) on the back showing surface keratin and scale with linear-dotted vessels',
      caption:
        'Dermoscopy of the lesion shows keratin and scale on the surface, along with linear-dotted vessels — patterns commonly seen in squamous cell carcinoma.',
    },
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
    clinical: { image: scc05Clinical, alt: 'Squamous cell carcinoma (SCC) on the arm in Fitzpatrick type II skin, biopsy-proven — clinical photo of lesion 5' },
    dermoscopy: { image: scc05Dermoscopy, alt: 'Dermoscopy of a biopsy-proven squamous cell carcinoma (SCC) on the arm from a real patient case, lesion 5' },
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
    clinical: { image: scc06Clinical, alt: 'Squamous cell carcinoma (SCC) on the leg in Fitzpatrick type II skin, biopsy-proven — clinical photo of lesion 6' },
    dermoscopy: {
      image: scc06Dermoscopy,
      alt: 'Dermoscopy of a biopsy-proven squamous cell carcinoma (SCC) on the leg showing surface keratin and scale with linear-dotted vessels',
      caption:
        'Dermoscopy of the lesion shows keratin and scale on the surface, along with linear-dotted vessels — patterns commonly seen in squamous cell carcinoma.',
    },
  },
];

export function getGalleryCases(category: GalleryCategory): GalleryCase[] {
  return galleryCases.filter((c) => c.category === category);
}
