const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { users, getNextUserId } = db;

router.get('/', (req, res) => {
  const { style, level, role, city } = req.query;
  
  let filtered = [...users];
  
  if (style) {
    filtered = filtered.filter(u => u.styles.includes(style));
  }
  
  if (level) {
    filtered = filtered.filter(u => u.level === level);
  }
  
  if (role) {
    filtered = filtered.filter(u => u.role === role || u.role === 'both');
  }
  
  if (city) {
    filtered = filtered.filter(u => u.city === city);
  }
  
  res.json(filtered);
});

router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

router.post('/', (req, res) => {
  const { name, danceYears, role, styles, level, bio, city } = req.body;
  
  if (!name || !role || !styles || !styles.length) {
    return res.status(400).json({ error: '请填写必要信息' });
  }
  
  const newUser = {
    id: getNextUserId(),
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    danceYears: danceYears || 0,
    role,
    styles,
    level: level || 'beginner',
    bio: bio || '',
    city: city || '上海',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

router.get('/match/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { style, preferredRole } = req.query;
  
  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  let candidates = users.filter(u => u.id !== userId);
  
  if (style) {
    candidates = candidates.filter(u => u.styles.includes(style));
  } else {
    candidates = candidates.filter(u => 
      u.styles.some(s => currentUser.styles.includes(s))
    );
  }
  
  let targetRole = preferredRole;
  if (!targetRole) {
    if (currentUser.role === 'leader') {
      targetRole = 'follower';
    } else if (currentUser.role === 'follower') {
      targetRole = 'leader';
    } else {
      targetRole = null;
    }
  }
  
  if (targetRole) {
    candidates = candidates.filter(u => u.role === targetRole || u.role === 'both');
  }
  
  candidates = candidates.map(candidate => {
    let score = 0;
    
    const commonStyles = candidate.styles.filter(s => currentUser.styles.includes(s));
    score += commonStyles.length * 20;
    
    const levelDiff = Math.abs(getLevelValue(candidate.level) - getLevelValue(currentUser.level));
    score += (3 - levelDiff) * 15;
    
    if (candidate.city === currentUser.city) {
      score += 10;
    }
    
    if (targetRole && candidate.role === targetRole) {
      score += 15;
    }
    
    return { ...candidate, matchScore: score };
  });
  
  candidates.sort((a, b) => b.matchScore - a.matchScore);
  
  res.json({
    currentUser,
    matches: candidates
  });
});

function getLevelValue(level) {
  const levels = { beginner: 1, intermediate: 2, advanced: 3 };
  return levels[level] || 1;
}

module.exports = router;
