import express from 'express';
import { supabase } from '../config/supabase.js';
import { getLocalStore, saveLocalStore } from '../config/store.js';

const router = express.Router();

// GET all certificates
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return res.json({ success: true, count: data.length, certificates: data });
    }

    const store = getLocalStore();
    res.json({ success: true, count: store.certificates.length, certificates: store.certificates });
  } catch (err) {
    const store = getLocalStore();
    res.json({ success: true, count: store.certificates.length, certificates: store.certificates });
  }
});

// REORDER certificates
router.put('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, error: 'orderedIds required' });

    try {
      const updates = orderedIds.map((id, index) => 
        supabase.from('certificates').update({ display_order: index }).eq('id', id)
      );
      await Promise.all(updates);
    } catch (e) {}

    const store = getLocalStore();
    const map = new Map(store.certificates.map(c => [c.id, c]));
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
    store.certificates = reordered;
    saveLocalStore(store);

    res.json({ success: true, message: 'Certificates reordered', certificates: store.certificates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add new certificate
router.post('/', async (req, res) => {
  try {
    const { title, issuer, issue_date, credential_url, image_url, description, display_order, is_featured } = req.body;
    if (!title || !issuer) {
      return res.status(400).json({ success: false, error: 'Title and Issuer are required' });
    }

    // Payload strictly matching Supabase table schema
    const supabasePayload = {
      title,
      issuer,
      issue_date: issue_date || '2024',
      credential_url: credential_url || '#',
      image_url: image_url || '',
      description: description || 'Verified achievement certificate',
      display_order: display_order !== undefined ? Number(display_order) : 0
    };

    const fullCertData = {
      ...supabasePayload,
      is_featured: is_featured !== undefined ? is_featured : true
    };

    let assignedId = "cert_" + Date.now();

    try {
      const { data, error } = await supabase.from('certificates').insert([supabasePayload]).select();
      if (!error && data && data[0]) {
        assignedId = data[0].id;
      } else if (error) {
        console.error('Supabase cert insert error:', error.message);
      }
    } catch (e) {}

    const finalCert = { id: assignedId, ...fullCertData };

    const store = getLocalStore();
    store.certificates.unshift(finalCert);
    saveLocalStore(store);

    res.status(201).json({ success: true, message: 'Certificate added', certificate: finalCert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update certificate
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const allowedKeys = ['title', 'issuer', 'issue_date', 'credential_url', 'image_url', 'description', 'display_order'];
    const supabasePayload = {};
    Object.keys(body).forEach(key => {
      if (allowedKeys.includes(key)) {
        supabasePayload[key] = body[key];
      }
    });

    if (Object.keys(supabasePayload).length > 0) {
      try {
        const { error } = await supabase.from('certificates').update(supabasePayload).eq('id', id);
        if (error) console.error('Supabase cert update error:', error.message);
      } catch (e) {}
    }

    const store = getLocalStore();
    const idx = store.certificates.findIndex(c => c.id === id);
    if (idx !== -1) {
      store.certificates[idx] = { ...store.certificates[idx], ...body };
      saveLocalStore(store);
      return res.json({ success: true, message: 'Certificate updated', certificate: store.certificates[idx] });
    }

    res.json({ success: true, message: 'Certificate updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE certificate
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      await supabase.from('certificates').delete().eq('id', id);
    } catch (e) {}

    const store = getLocalStore();
    store.certificates = store.certificates.filter(c => c.id !== id);
    saveLocalStore(store);

    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

