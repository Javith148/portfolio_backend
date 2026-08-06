import express from 'express';
import { supabase } from '../config/supabase.js';
import { getLocalStore, saveLocalStore } from '../config/store.js';

const router = express.Router();

// GET all skills
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return res.json({ success: true, count: data.length, skills: data });
    }

    const store = getLocalStore();
    res.json({ success: true, count: store.skills.length, skills: store.skills });
  } catch (err) {
    const store = getLocalStore();
    res.json({ success: true, count: store.skills.length, skills: store.skills });
  }
});

// REORDER skills
router.put('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, error: 'orderedIds required' });

    try {
      const updates = orderedIds.map((id, index) => 
        supabase.from('skills').update({ display_order: index }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (e) {}

    const store = getLocalStore();
    const map = new Map(store.skills.map(s => [s.id, s]));
    const reordered = [];

    orderedIds.forEach((id, index) => {
      const item = map.get(id);
      if (item) {
        item.display_order = index;
        reordered.push(item);
        map.delete(id);
      }
    });

    map.forEach(item => reordered.push(item));
    store.skills = reordered;
    saveLocalStore(store);

    res.json({ success: true, message: 'Skills reordered', skills: store.skills });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add new skill
router.post('/', async (req, res) => {
  try {
    const { name, category, icon_url, proficiency, display_order } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Skill name is required' });

    const newSkillData = {
      name,
      category: category || 'Frontend',
      icon_url: icon_url || 'https://skillicons.dev/icons?i=code',
      proficiency: proficiency !== undefined ? Number(proficiency) : 80,
      display_order: display_order !== undefined ? Number(display_order) : 0
    };

    let assignedId = "sk_" + Date.now();

    try {
      const { data, error } = await supabase.from('skills').insert([newSkillData]).select();
      if (!error && data && data[0]) {
        assignedId = data[0].id;
      } else if (error) {
        console.error('Supabase skill insert error:', error.message);
      }
    } catch (e) {}

    const finalSkill = { id: assignedId, ...newSkillData };

    const store = getLocalStore();
    store.skills.unshift(finalSkill);
    saveLocalStore(store);

    res.status(201).json({ success: true, message: 'Skill added', skill: finalSkill });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update skill
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    try {
      await supabase.from('skills').update(body).eq('id', id);
    } catch (e) {}

    const store = getLocalStore();
    const idx = store.skills.findIndex(s => s.id === id);
    if (idx !== -1) {
      store.skills[idx] = { ...store.skills[idx], ...body };
      saveLocalStore(store);
      return res.json({ success: true, message: 'Skill updated', skill: store.skills[idx] });
    }

    res.json({ success: true, message: 'Skill updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE skill
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      await supabase.from('skills').delete().eq('id', id);
    } catch (e) {}

    const store = getLocalStore();
    store.skills = store.skills.filter(s => s.id !== id);
    saveLocalStore(store);

    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

