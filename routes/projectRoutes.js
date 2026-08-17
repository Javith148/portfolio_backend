import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all projects (stored directly in Supabase)
router.get('/', async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      const fallbackQuery = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      data = fallbackQuery.data;
      error = fallbackQuery.error;
    }

    if (!error && Array.isArray(data)) {
      const formatted = data.map(dbProj => {
        const g = dbProj.gradient || dbProj.color || 'linear-gradient(175deg, #7F17DA 0%, #737373 100%)';
        return {
          ...dbProj,
          short_desc: dbProj.short_desc || dbProj.description?.substring(0, 120) || '',
          gradient: g,
          color: g,
          live_link: dbProj.live_link || '#',
          github_link: dbProj.github_link || '#',
          is_featured: dbProj.is_featured !== undefined ? dbProj.is_featured : true,
          display_order: dbProj.display_order ?? 0
        };
      });
      return res.json({ success: true, count: formatted.length, projects: formatted });
    }

    res.json({ success: false, error: error?.message || 'Failed to fetch projects from Supabase', projects: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, projects: [] });
  }
});

// REORDER projects directly in Supabase
router.put('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'orderedIds array is required' });
    }

    const updates = orderedIds.map((id, index) => 
      supabase.from('projects').update({ display_order: index }).eq('id', id)
    );
    await Promise.all(updates);

    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    res.json({ success: true, message: 'Projects reordered successfully in Supabase', projects: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create project directly in Supabase
router.post('/', async (req, res) => {
  try {
    const { title, description, short_desc, category, image_url, live_link, github_link, gradient, color, tags, display_order, is_featured } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
    const projGradient = gradient || color || 'linear-gradient(175deg, #7F17DA 0%, #737373 100%)';

    const fullProjectData = {
      title,
      description,
      short_desc: short_desc || description.substring(0, 120),
      category: category || 'Web App',
      image_url: image_url || '',
      live_link: live_link || '#',
      github_link: github_link || '#',
      gradient: projGradient,
      color: projGradient,
      tags: tagsArray,
      display_order: display_order !== undefined ? Number(display_order) : 0,
      is_featured: is_featured !== undefined ? is_featured : true
    };

    const { data, error } = await supabase.from('projects').insert([fullProjectData]).select();
    if (error) {
      const payloadWithoutColor = { ...fullProjectData };
      delete payloadWithoutColor.color;
      const res2 = await supabase.from('projects').insert([payloadWithoutColor]).select();
      if (res2.error) {
        return res.status(500).json({ success: false, error: res2.error.message });
      }
      return res.status(201).json({ success: true, message: 'Project created in Supabase', project: res2.data[0] });
    }

    res.status(201).json({ success: true, message: 'Project created in Supabase', project: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update project directly in Supabase
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updatedGradient = body.gradient || body.color;

    const allowedKeys = ['title', 'description', 'short_desc', 'category', 'image_url', 'live_link', 'github_link', 'gradient', 'color', 'tags', 'display_order', 'is_featured'];
    const supabasePayload = {};
    Object.keys(body).forEach(key => {
      if (allowedKeys.includes(key)) {
        supabasePayload[key] = body[key];
      }
    });

    if (updatedGradient) {
      supabasePayload.gradient = updatedGradient;
      supabasePayload.color = updatedGradient;
    }

    if (Array.isArray(body.tags)) {
      supabasePayload.tags = body.tags;
    } else if (typeof body.tags === 'string') {
      supabasePayload.tags = body.tags.split(',').map(t => t.trim());
    }

    const { data, error } = await supabase.from('projects').update(supabasePayload).eq('id', id).select();
    if (error) {
      delete supabasePayload.color;
      const res2 = await supabase.from('projects').update(supabasePayload).eq('id', id).select();
      if (res2.error) {
        return res.status(500).json({ success: false, error: res2.error.message });
      }
      return res.json({ success: true, message: 'Project updated in Supabase', project: res2.data[0] });
    }

    res.json({ success: true, message: 'Project updated in Supabase', project: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE project directly in Supabase
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'Project deleted from Supabase' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
