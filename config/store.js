import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INITIAL_PROJECTS = [];
const INITIAL_SKILLS = [];
const INITIAL_CERTS = [];
const INITIAL_MESSAGES = [];

// In-memory runtime data store (NO disk file writing to store.json)
let memoryStore = {
  projects: INITIAL_PROJECTS,
  skills: INITIAL_SKILLS,
  certificates: INITIAL_CERTS,
  contacts: INITIAL_MESSAGES
};

export function getLocalStore() {
  return memoryStore;
}

export function saveLocalStore(data) {
  if (data) {
    memoryStore = {
      projects: data.projects || memoryStore.projects,
      skills: data.skills || memoryStore.skills,
      certificates: data.certificates || memoryStore.certificates,
      contacts: data.contacts || memoryStore.contacts
    };
  }
}
