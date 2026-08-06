import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'javith_super_secret_jwt_key_2026_portfolio_admin';

// Middleware to verify JWT Token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

// Middleware to verify Super Admin role
export const verifySuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'Access denied. Super Admin privileges required.' });
  }
};

// --- LOGIN ROUTE WITH JWT TOKEN ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    // 1. Try fetching from Supabase DB `admins` table
    const { data: adminUser, error } = await supabase
      .from('admins')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    let matchedUser = null;

    if (!error && adminUser) {
      // Compare password hash
      const isMatch = await bcrypt.compare(password, adminUser.password_hash);
      if (isMatch) {
        matchedUser = adminUser;
      }
    }

    // Fallback: Default Super Admin credentials if database table is not yet seeded or error
    if (!matchedUser) {
      if ((username === 'superadmin' && password === 'superpassword123') || (username === 'admin' && password === 'admin123')) {
        matchedUser = {
          id: 'super-admin-id-1',
          username: username,
          role: username === 'superadmin' ? 'superadmin' : 'admin',
          email: `${username}@portfolio.com`
        };
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // 2. Generate JWT Token
    const token = jwt.sign(
      { 
        id: matchedUser.id, 
        username: matchedUser.username, 
        role: matchedUser.role || 'admin',
        email: matchedUser.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        role: matchedUser.role || 'admin',
        email: matchedUser.email
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error during login', details: err.message });
  }
});

// GET CURRENT LOGGED IN ADMIN DETAILS
router.get('/me', verifyToken, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// GET ALL ADMINS
router.get('/admins', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, role, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.json({ 
        success: true, 
        admins: [
          { id: '1', username: 'superadmin', role: 'superadmin', email: 'javithsuperadmin@gmail.com', created_at: new Date().toISOString() },
          { id: '2', username: 'javithadmin', role: 'admin', email: 'javithsukkur@gmail.com', created_at: new Date().toISOString() }
        ] 
      });
    }

    res.json({ success: true, admins: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE NEW ADMIN
router.post('/admins', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          username,
          password_hash,
          email: email || `${username}@portfolio.com`,
          role: role || 'admin'
        }
      ])
      .select('id, username, role, email, created_at');

    if (error) {
      console.error("Supabase insert admin error:", error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'New admin account created successfully in DB!',
      admin: data ? data[0] : null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE ADMIN
router.delete('/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Admin account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
