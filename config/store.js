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

const DEFAULT_ABOUT_CONTENT = [
  {
    id: "abt_1",
    title: "🎨 Creative at Heart",
    description: "I love bringing ideas to life visually before a single line of code is written. Whether it’s sketching wireframes on paper or designing sleek UI components in Figma, creativity is always at the core of what I do. Design, to me, isn’t just about how it looks — it’s about how it works.",
    display_order: 0
  },
  {
    id: "abt_2",
    title: "🎧 Fueled by Music",
    description: "My best work is often accompanied by the rhythm of music. From chill lo-fi beats during deep focus sessions to energizing tracks when pushing deadlines — music keeps my mind sharp and my flow uninterrupted",
    display_order: 1
  },
  {
    id: "abt_3",
    title: "🌙 Late-Night Dev Flow",
    description: "There’s something magical about building features in the quiet of the night — when everything’s still, and ideas flow effortlessly. It’s my favorite time to get into deep focus and bring concepts to life.",
    display_order: 2
  },
  {
    id: "abt_4",
    title: "🎮 Play = Progress",
    description: "Gaming is more than just fun — it sharpens my problem-solving mindset. Whether it’s strategy, storytelling, or UI in game menus, I find design inspiration in the digital worlds I explore.",
    display_order: 3
  },
  {
    id: "abt_5",
    title: "🌐 Passion for the Development",
    description: "There’s something exciting about the web’s endless possibility. I love building things that live online — accessible, responsive, and open to the world. Each project is a chance to contribute something useful and beautiful to the internet.",
    display_order: 4
  }
];

const DEFAULT_JOURNEY_ITEMS = [
  {
    id: "jrn_1",
    type: "Education",
    title: "B.Tech / B.Sc in Computer Science",
    organization: "XYZ University of Technology",
    period: "2021 - 2025",
    location: "Tamil Nadu, India",
    description: "Specialized in Software Engineering, Data Structures, Mobile App Development, and Web Technologies. Graduated with high distinction.",
    display_order: 0
  },
  {
    id: "jrn_2",
    type: "Work Experience",
    title: "Flutter & React Developer Intern",
    organization: "Tech Solutions Pvt Ltd",
    period: "2023 - 2024",
    location: "Remote / On-site",
    description: "Built responsive cross-platform mobile apps using Flutter & REST APIs. Developed sleek admin dashboard components using React and modern CSS.",
    display_order: 1
  },
  {
    id: "jrn_3",
    type: "Work Experience",
    title: "Full Stack Developer",
    organization: "Digital Innovations Lab",
    period: "2024 - Present",
    location: "Chennai, India",
    description: "Architected Node.js & Supabase backends for high-performance applications. Integrated real-time features, JWT authentication, and cloud storage.",
    display_order: 2
  },
  {
    id: "jrn_4",
    type: "Education",
    title: "Full Stack Web & Mobile Certification",
    organization: "Meta / Coursera Academy",
    period: "2023",
    location: "Online Certification",
    description: "Completed intensive specialization covering advanced React, Flutter UI/UX design patterns, state management, and backend API integration.",
    display_order: 3
  },
  {
    id: "jrn_5",
    type: "Milestone",
    title: "Published Mobile & Web Apps",
    organization: "Independent Projects",
    period: "2024",
    location: "Portfolio Ecosystem",
    description: "Successfully launched dynamic full-stack web portfolio and standalone Flutter Admin Application connected to live cloud services.",
    display_order: 4
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
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
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

