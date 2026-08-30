import type { ImageMetadata } from 'astro';
import stevenWangHeadshot from '../assets/steven-wang-headshot.jpg';
import davidSwansonHeadshot from '../assets/david-swanson-headshot.webp';
import yaserHomsiHeadshot from '../assets/yaser-homsi-headshot.jpg';
import thomasWangHeadshot from '../assets/thomas-wang-headshot.jpg';
import vernonSondakHeadshot from '../assets/vernon-sondak-headshot.webp';
import lauraFerrisHeadshot from '../assets/Ferris-Laura-wc1.avif';

export type BoardRole = 'Editor-in-Chief' | 'Medical Reviewer';

export interface BoardMember {
  /** URL-safe id; used as the anchor on /editorial-board and in reviewer bylines. */
  slug: string;
  /** Full name with post-nominals, e.g. "Steven Q. Wang, MD". */
  name: string;
  role: BoardRole;
  /** Short credential/specialty line, e.g. "Board-Certified Dermatologist · Mohs Surgeon". */
  credentials: string;
  /** Title and institution, e.g. "Chief of Dermatology, Hoag Memorial Hospital Presbyterian". */
  affiliation: string;
  /** Human-readable specialty line shown on the card, e.g. "Dermatology, dermoscopy, and skin cancer surgery". */
  specialty: string;
  /** 2–4 sentence biography. */
  bio: string;
  /** Omit until a real headshot is supplied; the card falls back to an initials avatar. */
  headshot?: ImageMetadata;
  /** Crop anchor (sharp `position`) for the square headshot; defaults to `center`. Use e.g. `"top"` when the subject's head sits high in the source frame. */
  headshotPosition?: string;
  /** External profile page (hospital, practice, or university bio). */
  profileUrl: string;
  /** Specialties for Physician JSON-LD. */
  medicalSpecialty: string[];
  alumniOf?: string[];
  /** Additional authoritative URLs for JSON-LD `sameAs`. */
  sameAs?: string[];
}

export const DEFAULT_REVIEWER_SLUG = 'steven-wang-md';

/**
 * The medical editorial board, in display order. The Editor-in-Chief is rendered
 * as a featured card; everyone with role "Medical Reviewer" appears in the grid
 * below, so keep reviewers ordered alphabetically by last name.
 */
export const editorialBoard: BoardMember[] = [
  {
    slug: 'steven-wang-md',
    name: 'Steven Q. Wang, MD',
    role: 'Editor-in-Chief',
    credentials: 'Board-Certified Dermatologist · Mohs Micrographic Surgeon',
    affiliation: 'Chief of Dermatology, Hoag Memorial Hospital Presbyterian',
    specialty: 'Dermatology, dermatologic oncology, and Mohs micrographic surgery',
    bio: 'Dr. Wang spent 16 years at Memorial Sloan Kettering Cancer Center, where he led the Dermatology Section in New Jersey. He is a co-founder of the Nanodermatology Society, a past president of the Photomedicine Society, and currently serves as Chair of the Photobiology Committee at the Skin Cancer Foundation. He has authored 6 books and published more than 100 peer-reviewed articles on the detection, treatment, and prevention of melanoma and skin cancer.',
    headshot: stevenWangHeadshot,
    profileUrl: 'https://www.hoag.org/physician/steven-q-wang-md',
    medicalSpecialty: ['Dermatology', 'Dermatologic Oncology', 'Mohs Micrographic Surgery'],
    alumniOf: ['Albert Einstein College of Medicine', 'University of Minnesota School of Medicine'],
    sameAs: ['https://www.hoag.org/physician/steven-q-wang-md'],
  },
  {
    slug: 'laura-ferris-md',
    name: 'Laura K. Ferris, M.D., Ph.D.',
    role: 'Medical Reviewer',
    credentials: 'M.D., Ph.D. · Board Certified in Dermatology · Clayton E. Wheeler, Jr. Distinguished Professor',
    affiliation: 'Chair, Department of Dermatology, University of North Carolina School of Medicine',
    specialty: 'Dermatology, pigmented lesions, and melanoma early detection',
    bio: 'Dr. Laura Ferris is Chair of the Department of Dermatology at UNC-Chapel Hill and holds the Clayton E. Wheeler, Jr. Distinguished Professorship. She earned her M.D. from the University of Maryland and her Ph.D. in immunology from Johns Hopkins, and completed her dermatology residency and cutaneous oncology fellowship at the University of Pittsburgh, where she previously served as clinical vice chair of dermatology and director of clinical trials at UPMC. Her clinical and research focus spans pigmented lesions and melanoma as well as psoriasis, with an emphasis on improving melanoma early detection through screening and novel diagnostic technologies.',
    headshot: lauraFerrisHeadshot,
    headshotPosition: 'top',
    profileUrl: 'https://www.med.unc.edu/derm/directory/laura-ferris-md-phd/',
    medicalSpecialty: ['Dermatology', 'Dermatologic Oncology', 'Cutaneous Oncology'],
    alumniOf: ['University of Maryland School of Medicine', 'Johns Hopkins University', 'University of Pittsburgh'],
    sameAs: ['https://www.med.unc.edu/derm/directory/laura-ferris-md-phd/'],
  },
  {
    slug: 'yaser-homsi-md',
    name: 'Yaser Homsi, MD',
    role: 'Medical Reviewer',
    credentials: 'Triple Board Certified in Hematology, Medical Oncology, and Internal Medicine',
    affiliation: 'Medical Oncologist and Hematologist, Hoag Family Cancer Institute',
    specialty: 'Medical oncology, hematology, and cancer immunotherapy',
    bio: 'Dr. Yaser Homsi is a medical oncologist and hematologist at Hoag Family Cancer Institute, triple board certified in hematology, medical oncology, and internal medicine. He earned his medical degree from the University of Aleppo and completed his residency and fellowship in oncology, hematology, and blood and bone marrow stem cell transplantation at Indiana University School of Medicine. Prior to joining Hoag, he served as an assistant clinical professor at City of Hope, and his research focuses on novel immunotherapy approaches to cancer treatment.',
    headshot: yaserHomsiHeadshot,
    headshotPosition: 'top',
    profileUrl: 'https://www.hoag.org/physician/yaser-homsi-md',
    medicalSpecialty: ['Hematology', 'Medical Oncology', 'Internal Medicine'],
    alumniOf: ['University of Aleppo', 'Indiana University School of Medicine'],
    sameAs: ['https://www.hoag.org/physician/yaser-homsi-md'],
  },
  {
    slug: 'vernon-sondak-md',
    name: 'Vernon K. Sondak, MD',
    role: 'Medical Reviewer',
    credentials: 'Board Certified in Surgery · Richard M. Schulze Family Foundation Distinguished Endowed Chair in Cutaneous Oncology',
    affiliation: 'Chair, Department of Cutaneous Oncology, H. Lee Moffitt Cancer Center and Research Institute',
    specialty: 'Surgical oncology, adult & pediatric melanoma, and sentinel lymph node biopsy',
    bio: "Dr. Vernon Sondak is Chair of the Department of Cutaneous Oncology at the H. Lee Moffitt Cancer Center and Research Institute in Tampa, Florida, where he holds the Richard M. Schulze Family Foundation Distinguished Endowed Chair in Cutaneous Oncology. He is a Professor in the Departments of Oncologic Sciences and Surgery at the University of South Florida Morsani College of Medicine and has been a leader in the surgical treatment of melanoma and other cutaneous malignancies, particularly the application of sentinel lymph node biopsy to melanoma staging. Since joining Moffitt in 2004, he has helped build its Cutaneous Oncology Clinic into one of the world's leading multidisciplinary treatment centers for melanoma. He is the author or coauthor of hundreds of peer-reviewed publications.",
    headshot: vernonSondakHeadshot,
    headshotPosition: 'top',
    profileUrl: 'https://www.moffitt.org/providers/vernon-sondak/',
    medicalSpecialty: ['Surgical Oncology', 'Surgery', 'Cutaneous Oncology'],
    sameAs: ['https://www.moffitt.org/providers/vernon-sondak/'],
  },
  {
    slug: 'david-swanson-md',
    name: 'David L. Swanson, MD',
    role: 'Medical Reviewer',
    credentials: 'Board Certified in Dermatology and Internal Medicine',
    affiliation: 'Professor of Dermatology and Residency Program Director, Mayo Clinic Arizona',
    specialty: 'Dermatology, dermoscopy, and high-risk skin cancer surveillance',
    bio: 'Dr. David Swanson is a Professor of Dermatology and Residency Program Director at Mayo Clinic Arizona, board certified in both Dermatology and Internal Medicine. He serves on the Executive Board of the International Dermoscopy Society and has spent two decades as editor of Practical Reviews in Dermatology. His clinical and research interests center on high-risk skin cancer monitoring, dermoscopy, and melanoma epidemiology, with more than 50 publications and international lectures on skin cancer detection and therapy.',
    headshot: davidSwansonHeadshot,
    headshotPosition: 'top',
    profileUrl: 'https://www.mayoclinic.org/biographies/swanson-david-l-m-d/bio-20054444',
    medicalSpecialty: ['Dermatology', 'Internal Medicine', 'Dermoscopy'],
    sameAs: ['https://www.mayoclinic.org/biographies/swanson-david-l-m-d/bio-20054444'],
  },
  {
    slug: 'thomas-wang-md',
    name: 'Thomas N. Wang, MD, PhD',
    role: 'Medical Reviewer',
    credentials: 'MD, PhD · Board Certified in Surgery (American Board of Surgery)',
    affiliation: 'Surgical Oncologist and Medical Director, Hoag Melanoma/Advanced Skin Cancer Program, Hoag Family Cancer Institute',
    specialty: 'Surgical oncology, melanoma, soft tissue sarcoma, and endocrine surgery',
    bio: 'Dr. Thomas Wang is a board-certified surgical oncologist and Medical Director of the Hoag Melanoma/Advanced Skin Cancer Program at Hoag Family Cancer Institute. He joins Hoag after 15 years at the University of Alabama at Birmingham, where he served as Professor of Surgery and Chief of Surgical Oncology for the Birmingham VA Medical Center. He completed his surgical oncology fellowship at MD Anderson Cancer Center and has published over 40 peer-reviewed manuscripts, with clinical interests in melanoma, soft tissue sarcomas, and endocrine surgery.',
    headshot: thomasWangHeadshot,
    headshotPosition: 'top',
    profileUrl: 'https://www.hoag.org/physician/thomas-n-wang-md',
    medicalSpecialty: ['Surgical Oncology', 'Surgery', 'Endocrine Surgery'],
    alumniOf: ['The University of Texas MD Anderson Cancer Center'],
    sameAs: ['https://www.hoag.org/physician/thomas-n-wang-md'],
  },
];

/** Look up a board member by slug, falling back to the Editor-in-Chief. */
export function getBoardMember(slug: string = DEFAULT_REVIEWER_SLUG): BoardMember {
  return editorialBoard.find((m) => m.slug === slug) ?? editorialBoard[0];
}

/** Two-letter initials for the avatar fallback, e.g. "David L. Swanson, MD" -> "DS". */
export function initials(name: string): string {
  const words = name.split(',')[0].trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}
