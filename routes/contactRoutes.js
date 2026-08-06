import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all contact form messages
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, count: data.length, messages: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new message (Public endpoint for frontend contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email,
          subject: subject || 'General Query',
          message,
          is_read: false
        }
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Message sent successfully', contact: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('contacts')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, message: 'Message marked as read', contact: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
