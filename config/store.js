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

let memoryStore = {
  projects: [],
  skills: [],
  certificates: [],
  contacts: [],
  aboutContent: [],
  journeyItems: []
};

// Try loading from store.json on startup
try {
  if (fs.existsSync(storeFilePath)) {
    const raw = fs.readFileSync(storeFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    memoryStore = {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
      aboutContent: Array.isArray(parsed.aboutContent) ? parsed.aboutContent : [],
      journeyItems: Array.isArray(parsed.journeyItems) ? parsed.journeyItems : []
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
      aboutContent: data.aboutContent || memoryStore.aboutContent,
      journeyItems: data.journeyItems || memoryStore.journeyItems
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

