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
    title: "🎨 Creative at Heart",
    description: "I love bringing ideas to life visually before a single line of code is written. Whether it’s sketching wireframes on paper or designing sleek UI components in Figma, creativity is always at the core of what I do. Design, to me, isn’t just about how it looks — it’s about how it works.",
    display_order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: "abt_seed_2",
    title: "🎧 Fueled by Music",
    description: "My best work is often accompanied by the rhythm of music. From chill lo-fi beats during deep focus sessions to energizing tracks when pushing deadlines — music keeps my mind sharp and my flow uninterrupted",
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "abt_seed_3",
    title: "🌙 Late-Night Dev Flow",
    description: "There’s something magical about building features in the quiet of the night — when everything’s still, and ideas flow effortlessly. It’s my favorite time to get into deep focus and bring concepts to life.",
    display_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "abt_seed_4",
    title: "🎮 Play = Progress",
    description: "Gaming is more than just fun — it sharpens my problem-solving mindset. Whether it’s strategy, storytelling, or UI in game menus, I find design inspiration in the digital worlds I explore.",
    display_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: "abt_seed_5",
    title: "🌐 Passion for Development",
    description: "There’s something exciting about the web’s endless possibility. I love building things that live online — accessible, responsive, and open to the world. Each project is a chance to contribute something useful and beautiful to the internet.",
    display_order: 4,
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_JOURNEY_ITEMS = [
  {
    id: "jrn_seed_1",
    type: "Work Experience",
    title: "Full Stack & Mobile Developer",
    organization: "Freelance & Portfolio Development",
    period: "2023 - Present",
    location: "Remote / Chennai, India",
    description: "Developed cross-platform Flutter mobile applications and modern React web applications with Node.js & Django backends.",
    display_order: 0,
    created_at: new Date().toISOString()
  },
  {
    id: "jrn_seed_2",
    type: "Education",
    title: "B.E. Computer Science Engineering",
    organization: "Anna University / Institution",
    period: "2021 - 2025",
    location: "Tamil Nadu, India",
    description: "Specialized in Core Computer Science, Software Architecture, Data Structures, Web Technologies & Mobile App Development.",
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
