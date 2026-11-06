export type CharacterStatus = 'identity locked' | 'concept brief' | 'casting';

export type CharacterProfile = {
  name: string;
  role: string;
  status: CharacterStatus;
  image: string;
  imageAlt: string;
  description: string;
  useCases: readonly string[];
  realPerson: boolean;
};

export const characterProfiles: readonly CharacterProfile[] = [
  {
    name: 'Fee The Developer',
    role: 'Founder, builder, and lead spokesperson',
    status: 'identity locked',
    image: '/brand/ftd-founder-hero.webp',
    imageAlt:
      'Illustrated portrait of Fee The Developer in a branded hoodie surrounded by development tools',
    description:
      'The approved founder identity: direct, technically fluent, calm under pressure, and grounded in veteran discipline.',
    useCases: ['Founder stories', 'Product demos', 'Campaign voice'],
    realPerson: true,
  },
  {
    name: 'Systems Engineer',
    role: 'Staff character concept',
    status: 'concept brief',
    image: '/merch/model-hoodie-royal-blue.jpg',
    imageAlt:
      'Concept model wearing the royal blue Fee The Developer graphic hoodie',
    description:
      'A composed technical guide for architecture walkthroughs, implementation explainers, and behind-the-build content.',
    useCases: ['Technical demos', 'Build logs', 'Explainers'],
    realPerson: false,
  },
  {
    name: 'Client Success Lead',
    role: 'Staff character concept',
    status: 'concept brief',
    image: '/merch/model-hoodie-sage-green.jpg',
    imageAlt:
      'Concept model wearing the sage green Fee The Developer graphic hoodie',
    description:
      'A warm, practical host for onboarding, service education, launch checklists, and customer-support demonstrations.',
    useCases: ['Onboarding', 'Service guides', 'Support stories'],
    realPerson: false,
  },
  {
    name: 'Campaign Spokesperson',
    role: 'Advertising character concept',
    status: 'casting',
    image: '/merch/model-hoodie-vivid-red.jpg',
    imageAlt:
      'Concept model wearing the vivid red Fee The Developer graphic hoodie',
    description:
      'A high-energy campaign presence for short-form spots, apparel launches, and visual product demonstrations.',
    useCases: ['Ad concepts', 'Apparel campaigns', 'Social video'],
    realPerson: false,
  },
];

export const wardrobeCapsules = [
  {
    name: 'FTD workwear',
    detail:
      'Approved Fee The Developer hoodies, joggers, tees, and snapbacks in black, white, heather gray, royal blue, vivid red, and sage green.',
    footwear:
      'Wheat nubuck six-inch work-boot silhouette; authentic owner-supplied footwear photography required for exact branded product shots.',
  },
  {
    name: 'Retro rotation',
    detail:
      'Streetwear looks built around the FTD line with twelve distinct numbered retro basketball-sneaker silhouettes.',
    footwear:
      'Jordan Retro 1–12 are creative wardrobe references only. Generated concepts omit third-party logos and protected trade dress.',
  },
  {
    name: 'Knit runner',
    detail:
      'Monochrome FTD sets paired with a sculpted knit runner for travel, studio, and casual founder scenes.',
    footwear:
      'Yeezy 350 is a fit reference only. Final branded placement requires authentic owner-supplied or licensed product imagery.',
  },
  {
    name: 'Executive tailoring',
    detail:
      'A full modern suit capsule spanning black, midnight navy, charcoal, ivory, taupe, forest, and deep plum in single- and double-breasted cuts.',
    footwear:
      'Tom Ford tailoring and Ferragamo leather goods guide the requested luxury direction; no affiliation, endorsement, or generated logos are implied.',
  },
] as const;

export const watchCapsule = [
  'Gold day-date watch with a presidential-style bracelet',
  'Steel and gold nautical sports watch with a regatta-ready profile',
] as const;
