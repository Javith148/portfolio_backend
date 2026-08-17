import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storeFilePath = path.join(__dirname, '..', 'data', 'store.json');

export const DEFAULT_GRADIENTS = [
  'linear-gradient(175deg, #EB7B18 0%, #737373 100%)', // Orange Sunset
  'linear-gradient(175deg, #7F17DA 0%, #737373 100%)', // Royal Purple
  'linear-gradient(175deg, #4851FF 0%, #737373 100%)', // Cyber Blue
  'linear-gradient(175deg, #30B45C 0%, #737373 100%)', // Emerald Green
  'linear-gradient(175deg, #D91A1A 0%, #222222 100%)'  // Crimson Red
];

export const DEFAULT_ABOUT_CONTENT = [
  {
    id: "abt_seed_1",
    title: "🎨 Creative Problem Solving",
    description: "Designing elegant UI/UX interfaces with Flutter and React that delight users and deliver seamless performance across devices.",
    display_order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: "abt_seed_2",
    title: "⚡ Backend Architecture",
    description: "Building robust RESTful APIs, secure authentication systems, and optimized database solutions using Node.js, Express, Django, and Supabase.",
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "abt_seed_3",
    title: "🚀 Continuous Learning",
    description: "Exploring bleeding-edge tech stacks, mobile responsiveness, and constantly sharpening software engineering skills to build better applications.",
    display_order: 2,
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_JOURNEY_ITEMS = [
  {
    id: "jrn_seed_1",
    type: "Education",
    title: "B.E. Computer Science Engineering",
    organization: "Anna University / Institution",
    period: "2021 - 2025",
    location: "Tamil Nadu, India",
    description: "Specialized in Core Computer Science, Software Architecture, Data Structures, Web Technologies & Mobile App Development.",
    display_order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: "jrn_seed_2",
    type: "Work Experience",
    title: "Full Stack & Mobile Developer",
    organization: "Freelance & Portfolio Development",
    period: "2023 - Present",
    location: "Remote / Chennai, India",
    description: "Developed cross-platform Flutter mobile applications and modern React web applications with Node.js & Django backends.",
    display_order: 1,
    created_at: new Date().toISOString()
  }
];

let memoryStore = {
  projects: [],
  skills: [],
  certificates: [],
  contacts: [],
  aboutContent: DEFAULT_ABOUT_CONTENT,
  journeyItems: DEFAULT_JOURNEY_ITEMS
};

// Try loading from store.json on startup
try {
  if (fs.existsSync(storeFilePath)) {
    const raw = fs.readFileSync(storeFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    memoryStore = {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      certificates: Array.isArray(parsed.certificates) ? parsed.parsed : (Array.isArray(parsed.certificates) ? parsed.certificates : []),
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
      aboutContent: Array.isArray(parsed.aboutContent) && parsed.aboutContent.length > 0 ? parsed.aboutContent : DEFAULT_ABOUT_CONTENT,
      journeyItems: Array.isArray(parsed.journeyItems) && parsed.journeyItems.length > 0 ? parsed.journeyItems : DEFAULT_JOURNEY_ITEMS
    };
  }
} catch (e) {
  console.error('Failed to load store.json:', e.message);
}

export function getLocalStore() {
  return memoryStore;
}

export function saveLocalStore(data) {
  if (data) {
    memoryStore = {
      projects: data.projects || memoryStore.projects,
      skills: data.skills || memoryStore.skills,
      certificates: data.certificates || memoryStore.certificates,
      contacts: data.contacts || memoryStore.contacts,
      aboutContent: (data.aboutContent && data.aboutContent.length > 0) ? data.aboutContent : memoryStore.aboutContent,
      journeyItems: (data.journeyItems && data.journeyItems.length > 0) ? data.journeyItems : memoryStore.journeyItems
    };
    try {
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(storeFilePath, JSON.stringify(memoryStore, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write store.json:', e.message);
    }
  }
}
