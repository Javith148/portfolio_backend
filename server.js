import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets from portfolio components assets folder
app.use('/assets', express.static(path.join(__dirname, '../javiths_portfolio/src/components/assets')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/upload', uploadRoutes);

// Base Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'Active',
    message: 'Express.js + Supabase Portfolio Admin Server is running 🚀',
    endpoints: {
      auth: '/api/auth (POST /login, GET /admins, POST /admins, DELETE /admins/:id)',
      projects: '/api/projects (GET, POST, PUT, DELETE, PUT /reorder)',
      contacts: '/api/contacts (GET, POST, PATCH /:id/read, DELETE)',
      skills: '/api/skills (GET, POST, PUT, DELETE, PUT /reorder)',
      certificates: '/api/certificates (GET, POST, PUT, DELETE, PUT /reorder)',
      seed: '/api/seed (POST)'
    }
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Admin Backend Server running on http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
