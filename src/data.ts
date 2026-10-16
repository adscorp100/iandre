// Everything on the page comes from this file. Edit here, not in the markup.
// Rules: no revenue or money numbers, no em dashes, straight quotes only,

export const profile = {
  name: 'Andre Smith',
  // Hidden search data only: people search the full name. Never shown on the page.
  alternateName: 'Andre Dean Smith',
  lede: 'Co-founder and CEO of ScreenApp and Carevo. Sydney.',
  jobTitle: 'Co-founder and CEO',
  // Bio carries the why; the Work rows carry the what.
  // Waiting on Andre: it mentions his family's search for care (Stone & Chalk, 2026).
  // Until he approves, no bio is shown, so the products are not described twice.
  bio: {
    approved: true,
    text: "I build software companies. ScreenApp turns recordings into notes and transcripts. I started Carevo after my family's own search for care, to help Australian families find NDIS and aged care providers.",
  },
  // Head-and-shoulders crop of the source photo, nobody else in frame.
  photo: '/andre-600.webp',
  url: 'https://iandre.com',
  title: 'Andre Smith, co-founder and CEO of ScreenApp and Carevo',
  description:
    'Andre Smith runs ScreenApp, an AI note taker, recorder and transcription app, and Carevo, a connection platform that helps Australian families find NDIS and aged care providers.',
};

// orgId: reuse the site's own JSON-LD @id where it publishes one (carevo.com.au
// does, checked 16 Oct 2026); screenapp.io publishes none, so we mint one here.
export const work: { name: string; description: string; url: string; domain: string; orgDescription: string; orgId: string }[] = [
  {
    name: 'ScreenApp',
    description: 'AI note taker, recorder and transcription.',
    url: 'https://screenapp.io',
    domain: 'screenapp.io',
    orgDescription: 'AI note taker, recorder and transcription.',
    orgId: 'https://iandre.com/#screenapp',
  },
  {
    name: 'Carevo',
    description: 'Connection platform that helps families find NDIS and aged care providers.',
    url: 'https://carevo.com.au',
    domain: 'carevo.com.au',
    orgDescription: 'A connection platform that helps Australian families find NDIS and aged care providers.',
    orgId: 'https://carevo.com.au/#organization',
  },
];

// Co-founder named by Antler (2023) and Stone & Chalk (2026). Structured data only.
export const cofounder = 'Buddhika Jayawardhana';

// Path, newest first.
export const path: { when: string; what: string; note?: string; url?: string }[] = [
  { when: 'Now', what: 'ScreenApp', url: 'https://screenapp.io' },
  { when: 'Now', what: 'Carevo', url: 'https://carevo.com.au' },
  { when: '2023', what: 'UNSW Founders 10x Accelerator', url: 'https://unswfounders.com' },
  { when: '2022', what: 'Antler Australia', note: 'Cohort 7', url: 'https://www.antler.co/location/australia' },
  { when: 'Before', what: 'myInterview', note: 'now part of Radancy', url: 'https://www.radancy.com/en/myinterview/' },
  { when: 'Before', what: 'Infogram', url: 'https://infogram.com' },
  { when: 'Before', what: 'Prezi', url: 'https://prezi.com' },
  { when: '2014', what: 'UNSW Sydney', url: 'https://www.unsw.edu.au' },
];

export const talks: { event: string; role: string; year: string; url?: string; photo?: { src: string; mid: string; alt: string; caption: string } }[] = [
  {
    event: 'Antler Australia',
    role: 'Go-to-market masterclass',
    year: '2026',
    photo: {
      src: '/antler-gtm-masterclass-2026.webp',
      mid: '/antler-gtm-masterclass-2026-960.webp',
      alt: 'Andre Smith presenting a go-to-market masterclass to founders at Antler Australia, February 2026',
      caption: 'Go-to-market masterclass for founders at Antler Australia, February 2026. Andre speaks regularly at Antler.',
    },
  },
  {
    event: 'Google Cloud Summit Sydney',
    role: 'Panel',
    year: '2025',
    photo: {
      src: '/google-cloud-summit-2025.webp',
      mid: '/google-cloud-summit-2025-960.webp',
      alt: 'Andre Smith speaking on a panel at Google Cloud Summit Sydney 2025, with Google Cloud, Montu and Lorikeet',
      caption: 'Panel at Google Cloud Summit Sydney, 2025. Andre Smith, co-founder and CEO of ScreenApp, far right.',
    },
  },
];

// Video appearances, shown with thumbnails.
export const videos: { show: string; title: string; year: string; id: string }[] = [
  { show: 'The Diary of a Founder', title: 'Interview on The Diary of a Founder', year: '2026', id: 'hxTc6DRMoxI' },
];

export const press: { publisher: string; kind: string; title: string; year: string; url: string }[] = [
  { publisher: 'Stone & Chalk', kind: 'Founder story', title: "How a family's search for care inspired Carevo", year: '2026', url: 'https://www.stoneandchalk.com.au/articles/how-a-familys-search-for-care-inspired-carevo' },
  { publisher: 'Inside Ageing', kind: 'Guest article', title: 'Registered is not the same as available', year: '2026', url: 'https://insideageing.com.au/guest-post-registered-is-not-the-same-as-available/' },
  { publisher: 'UNSW Founders', kind: 'Spotlight', title: 'ScreenApp founder launches Carevo helping Australians find the right care provider faster', year: '2026', url: 'https://unswfounders.com/newsletter/spotlight-founder-story-andre-dean-smith' },
  { publisher: 'Pulse+IT', kind: 'Press', title: 'Carevo offers time-saving connection to a provider', year: '2026', url: 'https://www.pulseit.news/aged-community-disabled-care/carevo-offers-time-saving-connection-to-a-provider/' },
  { publisher: 'Antler', kind: 'Founder story', title: 'A first-time founder shares his experience building a startup with Antler', year: '2023', url: 'https://www.antler.co/blog/first-time-founder-building-startup-with-antler' },
  { publisher: 'Balance The Grind', kind: 'Interview', title: 'Andre Smith, co-founder and CEO at ScreenApp', year: '2023', url: 'https://balancethegrind.co/interviews/andre-dean-smith-co-founder-ceo-at-screenapp/' },
  { publisher: 'Startup Daily', kind: 'Antler investor memo', title: 'ScreenApp revolutionises video capture and organisation with AI', year: '2023', url: 'https://www.startupdaily.net/partner-content/antler-australia/antler-investor-memo-series-business-assistant-screenapp-revolutionises-video-capture-and-organisation-with-ai/' },
];

export const contact: { label: string; url: string }[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/andredeansmith' },
  { label: 'X', url: 'https://x.com/andre_dean' },
];

// Structured data only, not shown on the page.
export const sameAsExtra = [
  'https://www.crunchbase.com/person/andre-dean-smith',
  'https://screenapp.io/author/andre-smith',
  'https://carevo.com.au/authors/andre-smith',
];
