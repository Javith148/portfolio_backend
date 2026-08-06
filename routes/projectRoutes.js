import express from 'express';
import { supabase } from '../config/supabase.js';
import { getLocalStore, saveLocalStore } from '../config/store.js';

const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    const store = getLocalStore();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const storeMap = new Map((store.projects || []).map(sp => [sp.id, sp]));
      const mergedProjects = data.map(dbProj => {
        const local = storeMap.get(dbProj.id) || {};
        return {
          ...dbProj,
          short_desc: dbProj.short_desc || local.short_desc || dbProj.description?.substring(0, 120) || '',
          gradient: dbProj.gradient || local.gradient || 'linear-gradient(175deg, #7F17DA 0%, #737373 100%)',
          live_link: dbProj.live_link || local.live_link || '#',
          github_link: dbProj.github_link || local.github_link || '#',
          is_featured: dbProj.is_featured !== undefined ? dbProj.is_featured : (local.is_featured !== undefined ? local.is_featured : true),
          display_order: dbProj.display_order !== undefined ? dbProj.display_order : (local.display_order || 0)
        };
      });

      // Also append local projects not found in Supabase data
      const dbIds = new Set(data.map(d => d.id));
      (store.projects || []).forEach(sp => {
        if (!dbIds.has(sp.id)) mergedProjects.push(sp);
      });

      return res.json({ success: true, count: mergedProjects.length, projects: mergedProjects });
    }

    res.json({ success: true, count: store.projects.length, projects: store.projects });
  } catch (err) {
    const store = getLocalStore();
    res.json({ success: true, count: store.projects.length, projects: store.projects });
  }
});

// REORDER projects
router.put('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'orderedIds array is required' });
    }

    const store = getLocalStore();
    const projectMap = new Map(store.projects.map(p => [p.id, p]));
    const reordered = [];

    orderedIds.forEach((id, index) => {
      const p = projectMap.get(id);
      if (p) {
        p.display_order = index;
        reordered.push(p);
        projectMap.delete(id);
      }
    });

    projectMap.forEach(p => reordered.push(p));
    store.projects = reordered;
    saveLocalStore(store);

    res.json({ success: true, message: 'Projects reordered successfully', projects: store.projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const { title, description, short_desc, category, image_url, live_link, github_link, gradient, tags, display_order, is_featured } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);

    const fullProjectData = {
      title,
      description,
      short_desc: short_desc || description.substring(0, 120),
      category: category || 'Web App',
      image_url: image_url || '',
      live_link: live_link || '#',
      github_link: github_link || '#',
      gradient: gradient || 'linear-gradient(175deg, #7F17DA 0%, #737373 100%)',
      tags: tagsArray,
      display_order: display_order !== undefined ? Number(display_order) : 0,
      is_featured: is_featured !== undefined ? is_featured : true
    };

    let assignedId = "proj_" + Date.now();

    // Insert into Supabase
    try {
      let { data, error } = await supabase.from('projects').insert([fullProjectData]).select();
      if (error) {
        const corePayload = {
          title,
          description,
          category: category || 'Web App',
          image_url: image_url || '',
          live_link: live_link || '#',
          github_link: github_link || '#',
          tags: tagsArray
        };
        const res2 = await supabase.from('projects').insert([corePayload]).select();
        data = res2.data;
      }
      if (data && data[0]) {
        assignedId = data[0].id;
      }
    } catch (e) {
      console.error('Supabase exception:', e.message);
    }

    const storeItem = { id: assignedId, ...fullProjectData, created_at: new Date().toISOString() };

    const store = getLocalStore();
    store.projects.unshift(storeItem);
    saveLocalStore(store);

    res.status(201).json({ success: true, message: 'Project created successfully', project: storeItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const allowedKeys = ['title', 'description', 'short_desc', 'category', 'image_url', 'live_link', 'github_link', 'gradient', 'tags', 'display_order', 'is_featured'];
    const supabasePayload = {};
    Object.keys(body).forEach(key => {
      if (allowedKeys.includes(key)) {
        supabasePayload[key] = body[key];
      }
    });

    if (Object.keys(supabasePayload).length > 0) {
      try {
        const { error } = await supabase.from('projects').update(supabasePayload).eq('id', id);
        if (error) {
          const coreKeys = ['title', 'description', 'category', 'image_url', 'live_link', 'github_link', 'tags'];
          const corePayload = {};
          Object.keys(body).forEach(k => { if (coreKeys.includes(k)) corePayload[k] = body[k]; });
          await supabase.from('projects').update(corePayload).eq('id', id);
        }
      } catch (e) {}
    }

    const store = getLocalStore();
    const idx = store.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      store.projects[idx] = {
        ...store.projects[idx],
        ...body,
        tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map(t => t.trim()) : store.projects[idx].tags)
      };
    } else {
      store.projects.push({ id, ...body });
    }
    saveLocalStore(store);

    res.json({ success: true, message: 'Project updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {}

    const store = getLocalStore();
    store.projects = store.projects.filter(p => p.id !== id);
    saveLocalStore(store);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

