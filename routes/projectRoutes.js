import express from 'express';
import { supabase } from '../config/supabase.js';
import { getLocalStore, saveLocalStore, DEFAULT_GRADIENTS } from '../config/store.js';

const router = express.Router();

// Helper to filter payload keys that match valid database schema columns
const sanitizeSupabasePayload = (data) => {
  const allowedCols = ['title', 'description', 'short_desc', 'category', 'image_url', 'live_link', 'github_link', 'tags', 'gradient', 'color'];
  const payload = {};
  allowedCols.forEach(col => {
    if (data[col] !== undefined) {
      payload[col] = data[col];
    }
  });
  return payload;
};

// GET all projects (stored in Supabase & synchronized with store)
router.get('/', async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    const store = getLocalStore();
    const storeMap = new Map((store.projects || []).map(p => [String(p.id), p]));
    const storeTitleMap = new Map((store.projects || []).map(p => [String(p.title).toLowerCase(), p]));

    if (!error && Array.isArray(data)) {
      const formatted = data.map((dbProj, idx) => {
        const matchedStore = storeMap.get(String(dbProj.id)) || storeTitleMap.get(String(dbProj.title).toLowerCase());
        const g = dbProj.gradient || dbProj.color || matchedStore?.gradient || matchedStore?.color || DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length];
        return {
          ...matchedStore,
          ...dbProj,
          short_desc: dbProj.short_desc || matchedStore?.short_desc || dbProj.description?.substring(0, 120) || '',
          gradient: g,
          color: g,
          live_link: dbProj.live_link || '#',
          github_link: dbProj.github_link || '#',
          is_featured: matchedStore?.is_featured !== undefined ? matchedStore.is_featured : (dbProj.is_featured !== undefined ? dbProj.is_featured : true),
          display_order: matchedStore?.display_order !== undefined ? matchedStore.display_order : (dbProj.display_order ?? idx)
        };
      });

      // Sort by display_order if available
      formatted.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

      store.projects = formatted;
      saveLocalStore(store);

      return res.json({ success: true, count: formatted.length, projects: formatted });
    }

    const fallbackProjects = (store.projects || []).map((p, idx) => ({
      ...p,
      gradient: p.gradient || p.color || DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length],
      color: p.gradient || p.color || DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length]
    }));

    res.json({ success: true, count: fallbackProjects.length, projects: fallbackProjects });
  } catch (err) {
    const store = getLocalStore();
    res.json({ success: true, count: (store.projects || []).length, projects: store.projects || [] });
  }
});

// REORDER projects
router.put('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'orderedIds array is required' });
    }

    try {
      const updates = orderedIds.map((id, index) => 
        supabase.from('projects').update({ display_order: index }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.projects) store.projects = [];
    const map = new Map(store.projects.map(item => [String(item.id), item]));
    const reordered = [];

    orderedIds.forEach((id, index) => {
      const item = map.get(String(id));
      if (item) {
        item.display_order = index;
        reordered.push(item);
        map.delete(String(id));
      }
    });

    map.forEach(item => reordered.push(item));
    store.projects = reordered;
    saveLocalStore(store);

    res.json({ success: true, message: 'Projects reordered successfully', projects: store.projects });
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
    const projGradient = gradient || color || DEFAULT_GRADIENTS[0];

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

    let assignedItem = null;

    // Try inserting into Supabase using sanitized payload
    try {
      const dbPayload = sanitizeSupabasePayload(fullProjectData);
      const { data, error } = await supabase.from('projects').insert([dbPayload]).select();
      if (!error && data && data[0]) {
        assignedItem = { ...fullProjectData, ...data[0], gradient: projGradient, color: projGradient };
      } else if (error) {
        const minimalPayload = { ...dbPayload };
        delete minimalPayload.short_desc;
        const res2 = await supabase.from('projects').insert([minimalPayload]).select();
        if (!res2.error && res2.data && res2.data[0]) {
          assignedItem = { ...fullProjectData, ...res2.data[0], gradient: projGradient, color: projGradient };
        }
      }
    } catch (e) {}

    const finalProject = assignedItem || {
      id: "proj_" + Date.now(),
      ...fullProjectData,
      created_at: new Date().toISOString()
    };

    const store = getLocalStore();
    if (!store.projects) store.projects = [];
    store.projects.unshift(finalProject);
    saveLocalStore(store);

    res.status(201).json({ success: true, message: 'Project created successfully', project: finalProject });
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
    const projGradient = updatedGradient || body.gradient || body.color;

    const dbPayload = sanitizeSupabasePayload(body);
    if (projGradient) {
      dbPayload.gradient = projGradient;
      dbPayload.color = projGradient;
    }

    if (Array.isArray(body.tags)) {
      dbPayload.tags = body.tags;
    } else if (typeof body.tags === 'string') {
      dbPayload.tags = body.tags.split(',').map(t => t.trim());
    }

    let updatedDbItem = null;

    try {
      const { data, error } = await supabase.from('projects').update(dbPayload).eq('id', id).select();
      if (!error && data && data[0]) {
        updatedDbItem = data[0];
      } else if (error) {
        const minimalPayload = { ...dbPayload };
        delete minimalPayload.short_desc;
        const res2 = await supabase.from('projects').update(minimalPayload).eq('id', id).select();
        if (!res2.error && res2.data && res2.data[0]) {
          updatedDbItem = res2.data[0];
        }
      }
    } catch (e) {}

    const store = getLocalStore();
    if (!store.projects) store.projects = [];
    const idx = store.projects.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      store.projects[idx] = {
        ...store.projects[idx],
        ...(updatedDbItem || {}),
        ...body,
        ...(projGradient ? { gradient: projGradient, color: projGradient } : {})
      };
      saveLocalStore(store);
      return res.json({ success: true, message: 'Project updated successfully', project: store.projects[idx] });
    }

    const mergedObj = { ...(updatedDbItem || {}), ...body, ...(projGradient ? { gradient: projGradient, color: projGradient } : {}) };
    store.projects.push(mergedObj);
    saveLocalStore(store);

    res.json({ success: true, message: 'Project updated successfully', project: mergedObj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE project directly in Supabase
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.projects) store.projects = [];
    store.projects = store.projects.filter(p => String(p.id) !== String(id));
    saveLocalStore(store);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
