import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../javiths_portfolio/src/components/assets/uploads');

// Ensure uploads directory exists for local dev fallback
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore folder creation errors on read-only environments
}

// Cache bucket check
let isBucketEnsured = false;
async function ensureBucket() {
  if (isBucketEnsured) return;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (!error && buckets) {
      const exists = buckets.some(b => b.name === 'portfolio-assets');
      if (!exists) {
        console.log("Bucket 'portfolio-assets' not found in Supabase. Creating public bucket...");
        const { error: createErr } = await supabase.storage.createBucket('portfolio-assets', { public: true });
        if (createErr) {
          console.warn('Supabase bucket creation warning:', createErr.message);
        } else {
          console.log("Public bucket 'portfolio-assets' created successfully in Supabase!");
        }
      }
    }
    isBucketEnsured = true;
  } catch (err) {
    console.warn('Supabase bucket check skipped:', err.message);
  }
}

// POST /api/upload - Upload image to Supabase Storage (primary)
router.post('/', async (req, res) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Extract base64 data and extension
    let extension = 'png';
    let base64Data = image;

    const matches = image.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const rawExt = matches[1].toLowerCase();
      extension = rawExt === 'jpeg' ? 'jpg' : rawExt;
      base64Data = matches[2];
    } else if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      base64Data = parts[1];
      if (parts[0].includes('/')) {
        const rawExt = parts[0].split('/')[1] || 'png';
        extension = rawExt === 'jpeg' ? 'jpg' : rawExt;
      }
    }

    // Determine correct Content-Type for Supabase Storage
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml'
    };
    const contentType = mimeTypes[extension.toLowerCase()] || `image/${extension}`;

    const cleanName = (name || 'upload')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 30);
    const fileName = `${cleanName}_${Date.now()}.${extension}`;
    const buffer = Buffer.from(base64Data, 'base64');

    let publicUrl = null;
    let uploadedToSupabase = false;

    // 1. Upload directly to Supabase Storage bucket 'portfolio-assets'
    try {
      if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project')) {
        await ensureBucket();

        const { data, error } = await supabase.storage
          .from('portfolio-assets')
          .upload(fileName, buffer, {
            contentType,
            upsert: true
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('portfolio-assets')
            .getPublicUrl(fileName);

          if (urlData && urlData.publicUrl) {
            publicUrl = urlData.publicUrl;
            uploadedToSupabase = true;
            console.log(`✅ Image uploaded to Supabase Storage: ${publicUrl}`);
          }
        } else if (error) {
          console.error('❌ Supabase storage upload error:', error.message);
        }
      }
    } catch (sbErr) {
      console.error('❌ Supabase storage exception:', sbErr.message);
    }

    // 2. Fallback to local server disk if Supabase upload failed
    if (!uploadedToSupabase) {
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const serverBaseUrl = process.env.RENDER_EXTERNAL_URL || `${protocol}://${host}`;
      publicUrl = `${serverBaseUrl}/assets/uploads/${fileName}`;

      try {
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        const filePath = path.join(UPLOADS_DIR, fileName);
        fs.writeFileSync(filePath, buffer);
        console.warn('⚠️ Local file backup written:', publicUrl);
      } catch (fsErr) {
        console.warn('Local fs write skipped:', fsErr.message);
      }
    }

    res.json({
      success: true,
      message: uploadedToSupabase 
        ? 'Image uploaded to Supabase Storage successfully!' 
        : 'Image uploaded to local backup server',
      url: publicUrl,
      storage: uploadedToSupabase ? 'supabase' : 'local'
    });

  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
