import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../javiths_portfolio/src/components/assets/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /api/upload - Handles image file upload (base64 string or Data URL)
router.post('/', async (req, res) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Extract base64 data and mime type
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    let extension = 'png';
    let base64Data = image;

    if (matches && matches.length === 3) {
      extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    }

    const cleanName = (name || 'upload')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 30);
    const fileName = `${cleanName}_${Date.now()}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Dynamic host URL fallback (works on both localhost and deployed servers like Render)
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const serverBaseUrl = process.env.RENDER_EXTERNAL_URL || `${protocol}://${host}`;
    let publicUrl = `${serverBaseUrl}/assets/uploads/${fileName}`;

    // Try saving locally (best effort)
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr) {
      console.warn('Local fs write skipped:', fsErr.message);
    }

    // 2. Try uploading to Supabase Storage bucket 'portfolio-assets'
    try {
      if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project')) {
        const { data, error } = await supabase.storage
          .from('portfolio-assets')
          .upload(fileName, buffer, {
            contentType: `image/${extension}`,
            upsert: true
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('portfolio-assets')
            .getPublicUrl(fileName);
          if (urlData && urlData.publicUrl) {
            publicUrl = urlData.publicUrl;
          }
        } else if (error) {
          console.warn('Supabase storage upload returned error:', error.message);
        }
      }
    } catch (sbError) {
      console.warn('Supabase storage upload skipped or failed, using backend URL:', sbError.message);
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully!',
      url: publicUrl
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
