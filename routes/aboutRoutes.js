import express from 'express';
import { supabase } from '../config/supabase.js';
import { getLocalStore, saveLocalStore, DEFAULT_ABOUT_CONTENT, DEFAULT_JOURNEY_ITEMS } from '../config/store.js';

const router = express.Router();

// ==========================================
// 1. BEYOND THE CODE (ABOUT CONTENT) ROUTES
// ==========================================

// GET all about content blocks
router.get('/content', async (req, res) => {
  try {
    const store = getLocalStore();
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      data.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      store.aboutContent = data;
      saveLocalStore(store);

      return res.json({ success: true, count: data.length, content: data });
    }

    let fallback = (store.aboutContent && store.aboutContent.length > 0) ? store.aboutContent : DEFAULT_ABOUT_CONTENT;
    fallback = [...fallback].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    store.aboutContent = fallback;
    saveLocalStore(store);

    res.json({ success: true, count: fallback.length, content: fallback });
  } catch (err) {
    const store = getLocalStore();
    let fallback = (store.aboutContent && store.aboutContent.length > 0) ? store.aboutContent : DEFAULT_ABOUT_CONTENT;
    fallback = [...fallback].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    res.json({ success: true, count: fallback.length, content: fallback });
  }
});

// POST add new about content block
router.post('/content', async (req, res) => {
  try {
    const { title, description, display_order } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and Description are required' });
    }

    const store = getLocalStore();
    const nextOrder = display_order !== undefined ? Number(display_order) : (store.aboutContent ? store.aboutContent.length : 0);

    const newContent = {
      title,
      description,
      display_order: nextOrder
    };

    let assignedId = null;
    let dbItem = null;

    try {
      const { data, error } = await supabase.from('about_content').insert([newContent]).select();
      if (error) {
        console.error('Supabase insert about_content error:', error.message);
      }
      if (!error && data && data[0]) {
        assignedId = data[0].id;
        dbItem = data[0];
      }
    } catch (e) {
      console.error('Supabase exception inserting about_content:', e.message);
    }

    const finalItem = dbItem || { id: "abt_" + Date.now(), ...newContent, created_at: new Date().toISOString() };
    if (!store.aboutContent) store.aboutContent = [];
    store.aboutContent.push(finalItem);
    saveLocalStore(store);

    res.status(201).json({ success: true, message: 'About content added', item: finalItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// REORDER about content blocks
router.put('/content/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, error: 'orderedIds required' });

    try {
      const updates = orderedIds.map((id, index) => 
        supabase.from('about_content').update({ display_order: index }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.aboutContent) store.aboutContent = [];
    const map = new Map(store.aboutContent.map(item => [String(item.id), item]));
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
    store.aboutContent = reordered;
    saveLocalStore(store);

    res.json({ success: true, message: 'About content reordered', content: store.aboutContent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update about content block
router.put('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const allowedKeys = ['title', 'description', 'display_order'];
    const payload = {};
    Object.keys(body).forEach(k => {
      if (allowedKeys.includes(k)) payload[k] = body[k];
    });

    try {
      const { error } = await supabase.from('about_content').update(payload).eq('id', id);
      if (error) console.error('Supabase update about_content error:', error.message);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.aboutContent) store.aboutContent = [];
    const idx = store.aboutContent.findIndex(item => String(item.id) === String(id));
    if (idx !== -1) {
      store.aboutContent[idx] = { ...store.aboutContent[idx], ...body };
      saveLocalStore(store);
      return res.json({ success: true, message: 'About content updated', item: store.aboutContent[idx] });
    }

    res.json({ success: true, message: 'About content updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE about content block
router.delete('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { error } = await supabase.from('about_content').delete().eq('id', id);
      if (error) console.error('Supabase delete about_content error:', error.message);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.aboutContent) store.aboutContent = [];
    store.aboutContent = store.aboutContent.filter(item => String(item.id) !== String(id));
    saveLocalStore(store);

    res.json({ success: true, message: 'About content deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// 2. MY JOURNEY (TIMELINE) ROUTES
// ==========================================

// GET all journey timeline items
router.get('/journey', async (req, res) => {
  try {
    const store = getLocalStore();
    const { data, error } = await supabase
      .from('journey_items')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      data.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      store.journeyItems = data;
      saveLocalStore(store);

      return res.json({ success: true, count: data.length, journey: data });
    }

    let fallback = (store.journeyItems && store.journeyItems.length > 0) ? store.journeyItems : DEFAULT_JOURNEY_ITEMS;
    fallback = [...fallback].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    store.journeyItems = fallback;
    saveLocalStore(store);

    res.json({ success: true, count: fallback.length, journey: fallback });
  } catch (err) {
    const store = getLocalStore();
    let fallback = (store.journeyItems && store.journeyItems.length > 0) ? store.journeyItems : DEFAULT_JOURNEY_ITEMS;
    fallback = [...fallback].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    res.json({ success: true, count: fallback.length, journey: fallback });
  }
});

// POST add new journey timeline item
router.post('/journey', async (req, res) => {
  try {
    const { type, title, organization, period, location, description, display_order } = req.body;
    if (!title || !organization) {
      return res.status(400).json({ success: false, error: 'Title and Organization are required' });
    }

    const store = getLocalStore();
    const nextOrder = display_order !== undefined ? Number(display_order) : (store.journeyItems ? store.journeyItems.length : 0);

    const newJourney = {
      type: type || 'Education',
      title,
      organization,
      period: period || '',
      location: location || '',
      description: description || '',
      display_order: nextOrder
    };

    let assignedId = null;
    let dbItem = null;

    try {
      const { data, error } = await supabase.from('journey_items').insert([newJourney]).select();
      if (error) {
        console.error('Supabase insert journey_items error:', error.message);
      }
      if (!error && data && data[0]) {
        assignedId = data[0].id;
        dbItem = data[0];
      }
    } catch (e) {
      console.error('Supabase exception inserting journey item:', e.message);
    }

    const finalItem = dbItem || { id: "jrn_" + Date.now(), ...newJourney, created_at: new Date().toISOString() };
    if (!store.journeyItems) store.journeyItems = [];
    store.journeyItems.push(finalItem);
    saveLocalStore(store);

    res.status(201).json({ success: true, message: 'Journey item added', item: finalItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// REORDER journey items
router.put('/journey/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, error: 'orderedIds required' });

    try {
      const updates = orderedIds.map((id, index) => 
        supabase.from('journey_items').update({ display_order: index }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.journeyItems) store.journeyItems = [];
    const map = new Map(store.journeyItems.map(item => [String(item.id), item]));
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
    store.journeyItems = reordered;
    saveLocalStore(store);

    res.json({ success: true, message: 'Journey items reordered', journey: store.journeyItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update journey item
router.put('/journey/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const allowedKeys = ['type', 'title', 'organization', 'period', 'location', 'description', 'display_order'];
    const payload = {};
    Object.keys(body).forEach(k => {
      if (allowedKeys.includes(k)) payload[k] = body[k];
    });

    try {
      const { error } = await supabase.from('journey_items').update(payload).eq('id', id);
      if (error) console.error('Supabase update journey_items error:', error.message);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.journeyItems) store.journeyItems = [];
    const idx = store.journeyItems.findIndex(item => String(item.id) === String(id));
    if (idx !== -1) {
      store.journeyItems[idx] = { ...store.journeyItems[idx], ...body };
      saveLocalStore(store);
      return res.json({ success: true, message: 'Journey item updated', item: store.journeyItems[idx] });
    }

    res.json({ success: true, message: 'Journey item updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE journey item
router.delete('/journey/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const { error } = await supabase.from('journey_items').delete().eq('id', id);
      if (error) console.error('Supabase delete journey_items error:', error.message);
    } catch (e) {}

    const store = getLocalStore();
    if (!store.journeyItems) store.journeyItems = [];
    store.journeyItems = store.journeyItems.filter(item => String(item.id) !== String(id));
    saveLocalStore(store);

    res.json({ success: true, message: 'Journey item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
