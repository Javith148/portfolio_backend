import express from 'express';
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

const INITIAL_PROJECTS = [
  {
    title: "Curryard",
    description: "Curryard is a creatively themed restaurant website built to attract food enthusiasts with a taste for adventure. It blends bold visuals, Halloween-inspired branding, and engaging UI elements to create a unique dining atmosphere online.",
    short_desc: "A spooky-themed restaurant landing page designed for food lovers who crave a unique dining experience.",
    category: "Web App",
    image_url: "http://localhost:5000/assets/pro1.png",
    live_link: "#",
    github_link: "https://github.com/Javith148",
    gradient: "linear-gradient(175deg, #EB7B18 0%, #737373 100%)",
    tags: ["HTML", "CSS", "Figma"],
    display_order: 0
  },
  {
    title: "Portfolio",
    description: "This portfolio is a React-powered web application designed to highlight my expertise in frontend development and UI/UX design. Crafted with a sleek, modern layout, it offers a seamless user experience with smooth scrolling, responsive design, and interactive elements.",
    short_desc: "A clean, responsive portfolio to showcase my skills, projects, and personal brand — built for smooth navigation and modern UI.",
    category: "React App",
    image_url: "http://localhost:5000/assets/pro (1).png",
    live_link: "/",
    github_link: "https://github.com/Javith148",
    gradient: "linear-gradient(175deg, #7F17DA 0%, #737373 100%)",
    tags: ["React", "Tailwind CSS", "JavaScript"],
    display_order: 1
  },
  {
    title: "Smart Electrician Booking website",
    description: "This web platform connects users with nearby certified electricians using real-time geolocation powered by Leaflet.js and OpenStreetMap. Developed with Flask, HTML, CSS, and JavaScript, it offers a smooth and responsive user experience.",
    short_desc: "A location-based web app built with Flask and Leaflet.js to connect users with nearby certified electricians.",
    category: "Full Stack",
    image_url: "http://localhost:5000/assets/pro (2).png",
    live_link: "#",
    github_link: "https://github.com/Javith148",
    gradient: "linear-gradient(175deg, #4851FF 0%, #737373 100%)",
    tags: ["HTML", "CSS", "JavaScript", "Python"],
    display_order: 2
  },
  {
    title: "T-Shirt E-Commerce UI Design",
    description: "A trendy landing page for a T-shirt brand. It blends bold visuals and engaging UI elements to create a unique shopping atmosphere online.",
    short_desc: "Trendy landing page for a T-shirt brand. Clean layout, bold visuals — designed in Figma.",
    category: "UI/UX Design",
    image_url: "http://localhost:5000/assets/pro (3).png",
    live_link: "#",
    github_link: "https://github.com/Javith148",
    gradient: "linear-gradient(175deg, #30B45C 0%, #737373 100%)",
    tags: ["Figma"],
    display_order: 3
  }
];

const INITIAL_SKILLS = [
  { name: 'HTML', category: 'Frontend', icon_url: 'http://localhost:5000/assets/html.png', proficiency: 95, display_order: 0 },
  { name: 'CSS', category: 'Frontend', icon_url: 'http://localhost:5000/assets/css.png', proficiency: 90, display_order: 1 },
  { name: 'Javascript', category: 'Frontend', icon_url: 'http://localhost:5000/assets/javascript.png', proficiency: 88, display_order: 2 },
  { name: 'React', category: 'Frontend', icon_url: 'http://localhost:5000/assets/react.png', proficiency: 85, display_order: 3 },
  { name: 'Flutter', category: 'Mobile', icon_url: 'https://skillicons.dev/icons?i=flutter', proficiency: 85, display_order: 4 },
  { name: 'Dart', category: 'Mobile', icon_url: 'https://skillicons.dev/icons?i=dart', proficiency: 80, display_order: 5 },
  { name: 'Django', category: 'Backend', icon_url: 'https://skillicons.dev/icons?i=django', proficiency: 75, display_order: 6 },
  { name: 'Firebase', category: 'Backend', icon_url: 'https://skillicons.dev/icons?i=firebase', proficiency: 80, display_order: 7 },
  { name: 'MySQL', category: 'Database', icon_url: 'http://localhost:5000/assets/mysql.png', proficiency: 80, display_order: 8 },
  { name: 'Python', category: 'Programming', icon_url: 'http://localhost:5000/assets/python.png', proficiency: 85, display_order: 9 },
  { name: 'Postman', category: 'Tools', icon_url: 'https://skillicons.dev/icons?i=postman', proficiency: 85, display_order: 10 },
  { name: 'REST API', category: 'Backend', icon_url: 'https://www.svgrepo.com/show/375531/api.svg', proficiency: 90, display_order: 11 },
  { name: 'Canva', category: 'Design', icon_url: 'https://www.vectorlogo.zone/logos/canva/canva-icon.svg', proficiency: 80, display_order: 12 },
  { name: 'Tailwind CSS', category: 'Frontend', icon_url: 'https://skillicons.dev/icons?i=tailwind', proficiency: 90, display_order: 13 },
  { name: 'Figma', category: 'Design', icon_url: 'http://localhost:5000/assets/figma.png', proficiency: 88, display_order: 14 },
  { name: 'GitHub', category: 'Tools', icon_url: 'http://localhost:5000/assets/github.png', proficiency: 90, display_order: 15 },
  { name: 'Git', category: 'Tools', icon_url: 'http://localhost:5000/assets/git.png', proficiency: 85, display_order: 16 }
];

const INITIAL_CERTS = [
  {
    title: "Introduction to artificial intelligence (AI)",
    issuer: "Coursera",
    issue_date: "2024",
    description: "Gained foundational understanding of AI concepts including machine learning, neural networks, and intelligent systems.",
    image_url: "http://localhost:5000/assets/1.jpg",
    display_order: 0
  },
  {
    title: "javascript animation for website, Storytelling data visualization and games",
    issuer: "Coursera",
    issue_date: "2024",
    description: "Learned how to create dynamic, smooth animations using JavaScript and libraries like GSAP.",
    image_url: "http://localhost:5000/assets/2.jpg",
    display_order: 1
  },
  {
    title: "Build a Twitter clone front-end with react",
    issuer: "Coursera",
    issue_date: "2024",
    description: "Created a functional Twitter-like interface using React with component-based architecture.",
    image_url: "http://localhost:5000/assets/3.jpg",
    display_order: 2
  },
  {
    title: "Java for beginners : getting started",
    issuer: "Coursera",
    issue_date: "2024",
    description: "Introduced to the fundamentals of Java programming including variables, data types, loops, and OOP principles.",
    image_url: "http://localhost:5000/assets/4.jpg",
    display_order: 3
  },
  {
    title: "AWS S3 Basics",
    issuer: "Coursera",
    issue_date: "2024",
    description: "Gained a foundational understanding of Amazon S3, including how to store, manage, and retrieve data securely.",
    image_url: "http://localhost:5000/assets/5.jpg",
    display_order: 4
  },
  {
    title: "Hosting a Static website in AWS S3",
    issuer: "Coursera",
    issue_date: "2024",
    description: "Learned how to deploy static websites built with HTML, CSS, and JavaScript using Amazon S3.",
    image_url: "http://localhost:5000/assets/6.jpg",
    display_order: 5
  },
  {
    title: "Cybersecurity Workshop",
    issuer: "Novitech R&D Private Limited",
    issue_date: "2024",
    description: "Completed a hands-on cybersecurity workshop focused on foundational security principles.",
    image_url: "http://localhost:5000/assets/7.jpg",
    display_order: 6
  },
  {
    title: "Oracle Cloud Infrastructure Foundations Associate",
    issuer: "Oracle University",
    issue_date: "2024",
    description: "Earned foundational certification in Oracle Cloud Infrastructure (OCI).",
    image_url: "http://localhost:5000/assets/8.jpg",
    display_order: 7
  },
  {
    title: "Command line basics in linux",
    issuer: "Coursera",
    issue_date: "2024",
    description: "Learned how to navigate and manage files using Linux terminal commands.",
    image_url: "http://localhost:5000/assets/9.jpg",
    display_order: 8
  },
  {
    title: "Smart Electrician Booking System Website",
    issuer: "International Conference",
    issue_date: "2024",
    description: "Presented a research paper on a web-based platform for booking certified electricians.",
    image_url: "http://localhost:5000/assets/10.jpg",
    display_order: 9
  }
];

// POST /api/seed
router.post('/', async (req, res) => {
  try {
    // 1. Seed Projects if empty
    const { data: pCheck } = await supabase.from('projects').select('id');
    if (!pCheck || pCheck.length === 0) {
      await supabase.from('projects').insert(INITIAL_PROJECTS);
    }

    // 2. Seed Skills if empty
    const { data: sCheck } = await supabase.from('skills').select('id');
    if (!sCheck || sCheck.length === 0) {
      await supabase.from('skills').insert(INITIAL_SKILLS);
    }

    // 3. Seed Certificates if empty
    const { data: cCheck } = await supabase.from('certificates').select('id');
    if (!cCheck || cCheck.length === 0) {
      await supabase.from('certificates').insert(INITIAL_CERTS);
    }

    // 4. Seed Admin user if empty
    const { data: aCheck } = await supabase.from('admins').select('id');
    if (!aCheck || aCheck.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('admin123', salt);
      await supabase.from('admins').insert([
        { username: 'admin', password_hash, role: 'admin', email: 'admin@portfolio.com' }
      ]);
    }

    res.json({
      success: true,
      message: 'Database seeded with all projects, skills, certificates, and admin account!'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
