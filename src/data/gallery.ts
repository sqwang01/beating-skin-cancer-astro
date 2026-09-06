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

import mel01Clinical from '../images/gallery/melanoma/mel-01-clinical.jpg';
import mel01Dermoscopy from '../images/gallery/melanoma/mel-01-dermoscopy.jpg';
import mel02Clinical from '../images/gallery/melanoma/mel-02-clinical.jpg';
import mel02Dermoscopy from '../images/gallery/melanoma/mel-02-dermoscopy.jpg';
import mel03Clinical from '../images/gallery/melanoma/mel-03-clinical.jpg';
import mel03Dermoscopy from '../images/gallery/melanoma/mel-03-dermoscopy.jpg';
import mel04Clinical from '../images/gallery/melanoma/mel-04-clinical.jpg';
import mel04Dermoscopy from '../images/gallery/melanoma/mel-04-dermoscopy.jpg';
import mel05Clinical from '../images/gallery/melanoma/mel-05-clinical.jpg';
import mel05Dermoscopy from '../images/gallery/melanoma/mel-05-dermoscopy.jpg';
import mel06Clinical from '../images/gallery/melanoma/mel-06-clinical.jpg';
import mel06Dermoscopy from '../images/gallery/melanoma/mel-06-dermoscopy.jpg';
import mel07Clinical from '../images/gallery/melanoma/mel-07-clinical.jpg';
import mel07Dermoscopy from '../images/gallery/melanoma/mel-07-dermoscopy.jpg';
import mel08Clinical from '../images/gallery/melanoma/mel-08-clinical.jpg';
import mel08Dermoscopy from '../images/gallery/melanoma/mel-08-dermoscopy.jpg';
import mel09Clinical from '../images/gallery/melanoma/mel-09-clinical.jpg';
import mel09Dermoscopy from '../images/gallery/melanoma/mel-09-dermoscopy.jpg';
import mel10Clinical from '../images/gallery/melanoma/mel-10-clinical.jpg';
import mel10Dermoscopy from '../images/gallery/melanoma/mel-10-dermoscopy.jpg';
import mel11Clinical from '../images/gallery/melanoma/mel-11-clinical.jpg';
import mel11Dermoscopy from '../images/gallery/melanoma/mel-11-dermoscopy.jpg';
import mel12Clinical from '../images/gallery/melanoma/mel-12-clinical.jpg';
import mel12Dermoscopy from '../images/gallery/melanoma/mel-12-dermoscopy.jpg';

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
  ...([
    [mel01Clinical, mel01Dermoscopy, 'III'],
    [mel02Clinical, mel02Dermoscopy, 'III'],
    [mel03Clinical, mel03Dermoscopy, 'I'],
    [mel04Clinical, mel04Dermoscopy, 'II'],
    [mel05Clinical, mel05Dermoscopy, 'I'],
    [mel06Clinical, mel06Dermoscopy, 'II'],
    [mel07Clinical, mel07Dermoscopy, 'II'],
    [mel08Clinical, mel08Dermoscopy, 'I'],
    [mel09Clinical, mel09Dermoscopy, 'III'],
    [mel10Clinical, mel10Dermoscopy, 'III'],
    [mel11Clinical, mel11Dermoscopy, 'III'],
    [mel12Clinical, mel12Dermoscopy, 'II'],
  ] as [ImageMetadata, ImageMetadata, string][]).map(([clinical, dermoscopy, phototype], i): GalleryCase => {
    const n = i + 1;
    const id = `mel-${String(n).padStart(2, '0')}`;
    return {
      id,
      category: 'melanoma',
      diagnosis: 'Melanoma',
      biopsyProven: true,
      phototype,
      treatment: 'Wide local excision',
      consentStatus: 'verbal consent',
      credit: 'BeatingSkinCancer.com',
      clinical: {
        image: clinical,
        alt: `Melanoma in Fitzpatrick type ${phototype} skin, biopsy-proven — clinical photo of lesion ${n}`,
      },
      dermoscopy: {
        image: dermoscopy,
        alt: `Dermoscopy of a biopsy-proven melanoma from a real patient case, lesion ${n}`,
      },
    };
  }),
];

export function getGalleryCases(category: GalleryCategory): GalleryCase[] {
  return galleryCases.filter((c) => c.category === category);
}
