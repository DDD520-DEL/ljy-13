const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { 
  SUPPORTED_CITIES,
  users, 
  getNextUserId, 
  isFollowing, 
  isMutualFollowing, 
  getFollowers, 
  getFollowing, 
  addFollow, 
  removeFollow,
  normalizeStyles,
  getStyleNames,
  getStyleWeightMap,
  getUserAttendedDances,
  getUserDanceStats
} = db;

router.get('/', (req, res) => {
  const { style, level, role, city, currentUserId } = req.query;
  
  let filtered = [...users];
  
  if (style) {
    filtered = filtered.filter(u => getStyleNames(u.styles).includes(style));
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
  
  if (currentUserId) {
    const cid = parseInt(currentUserId);
    filtered = filtered.map(u => ({
      ...u,
      isFollowing: isFollowing(cid, u.id),
      isMutualFollowing: isMutualFollowing(cid, u.id)
    }));
  }
  
  res.json(filtered);
});

router.get('/:id', (req, res) => {
  const { currentUserId } = req.query;
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const result = { ...user };
  
  if (currentUserId) {
    const cid = parseInt(currentUserId);
    result.isFollowing = isFollowing(cid, user.id);
    result.isMutualFollowing = isMutualFollowing(cid, user.id);
  }
  
  result.followerCount = getFollowers(user.id).length;
  result.followingCount = getFollowing(user.id).length;
  
  res.json(result);
});

router.post('/', (req, res) => {
  const { name, danceYears, role, styles, level, bio, city } = req.body;
  
  if (!name || !role || !styles || !styles.length || !city) {
    return res.status(400).json({ error: '请填写必要信息' });
  }
  
  if (!SUPPORTED_CITIES.includes(city)) {
    return res.status(400).json({ error: '不支持的城市' });
  }
  
  const normalizedStyles = normalizeStyles(styles);
  
  const newUser = {
    id: getNextUserId(),
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    danceYears: danceYears || 0,
    role,
    styles: normalizedStyles,
    level: level || 'beginner',
    bio: bio || '',
    city,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const user = users[userIndex];
  const { name, danceYears, role, styles, level, bio, city } = req.body;
  
  if (name !== undefined) user.name = name;
  if (danceYears !== undefined) user.danceYears = danceYears;
  if (role !== undefined) user.role = role;
  if (level !== undefined) user.level = level;
  if (bio !== undefined) user.bio = bio;
  if (city !== undefined) {
    if (!SUPPORTED_CITIES.includes(city)) {
      return res.status(400).json({ error: '不支持的城市' });
    }
    user.city = city;
  }
  if (styles !== undefined) user.styles = normalizeStyles(styles);
  
  res.json(user);
});

function calculateWeightedStyleMatch(currentStyles, candidateStyles) {
  const currentWeights = getStyleWeightMap(currentStyles);
  const candidateWeights = getStyleWeightMap(candidateStyles);
  
  const currentStyleNames = Object.keys(currentWeights);
  const candidateStyleNames = Object.keys(candidateWeights);
  
  const commonStyles = currentStyleNames.filter(s => candidateStyleNames.includes(s));
  
  if (commonStyles.length === 0) {
    return { score: 0, commonStyles: [], details: [] };
  }
  
  let weightedSum = 0;
  let details = [];
  
  commonStyles.forEach(styleName => {
    const cw = currentWeights[styleName];
    const pw = candidateWeights[styleName];
    const minWeight = Math.min(cw, pw);
    const maxWeight = Math.max(cw, pw);
    const styleMatch = (minWeight / maxWeight) * 100;
    weightedSum += styleMatch;
    details.push({
      style: styleName,
      currentWeight: cw,
      candidateWeight: pw,
      matchScore: Math.round(styleMatch)
    });
  });
  
  const totalPossible = currentStyleNames.length * 100;
  const finalScore = Math.round((weightedSum / totalPossible) * 100);
  
  return {
    score: finalScore,
    commonStyles,
    details
  };
}

router.get('/match/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { style, preferredRole } = req.query;
  
  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  let candidates = users.filter(u => u.id !== userId);
  
  const currentStyleNames = getStyleNames(currentUser.styles);
  if (style) {
    candidates = candidates.filter(u => getStyleNames(u.styles).includes(style));
  } else {
    candidates = candidates.filter(u => 
      getStyleNames(u.styles).some(s => currentStyleNames.includes(s))
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
    const matchBreakdown = {};
    
    const styleMatch = calculateWeightedStyleMatch(currentUser.styles, candidate.styles);
    score += styleMatch.score * 0.5;
    matchBreakdown.styleMatch = {
      score: styleMatch.score,
      weight: 50,
      details: styleMatch.details
    };
    
    const levelDiff = Math.abs(getLevelValue(candidate.level) - getLevelValue(currentUser.level));
    const levelScore = (3 - levelDiff) * 25;
    score += levelScore;
    matchBreakdown.levelMatch = {
      score: levelScore,
      weight: 25
    };
    
    let cityScore = 0;
    if (candidate.city === currentUser.city) {
      cityScore = 20;
    }
    score += cityScore;
    matchBreakdown.cityMatch = {
      score: cityScore,
      weight: 20
    };
    
    let roleScore = 0;
    if (targetRole && candidate.role === targetRole) {
      roleScore = 5;
    }
    score += roleScore;
    matchBreakdown.roleMatch = {
      score: roleScore,
      weight: 5
    };
    
    const following = isFollowing(userId, candidate.id);
    const mutual = following && isFollowing(candidate.id, userId);
    
    if (mutual) {
      score += 10;
      matchBreakdown.social = { score: 10, label: '互相关注' };
    } else if (following) {
      score += 5;
      matchBreakdown.social = { score: 5, label: '已关注' };
    }
    
    const finalScore = Math.min(Math.round(score), 100);
    
    return { 
      ...candidate, 
      matchScore: finalScore,
      matchBreakdown,
      isFollowing: following,
      isMutualFollowing: mutual
    };
  });
  
  candidates.sort((a, b) => b.matchScore - a.matchScore);
  
  res.json({
    currentUser,
    matches: candidates
  });
});

router.post('/:id/follow', (req, res) => {
  const followingId = parseInt(req.params.id);
  const { followerId } = req.body;
  
  if (!followerId) {
    return res.status(400).json({ error: '缺少followerId' });
  }
  
  if (followerId === followingId) {
    return res.status(400).json({ error: '不能关注自己' });
  }
  
  const follower = users.find(u => u.id === followerId);
  const following = users.find(u => u.id === followingId);
  
  if (!follower || !following) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const result = addFollow(followerId, followingId);
  
  if (!result) {
    return res.status(400).json({ error: '已经关注过该用户' });
  }
  
  res.status(201).json({
    message: '关注成功',
    follow: result,
    isMutualFollowing: isMutualFollowing(followerId, followingId)
  });
});

router.delete('/:id/follow', (req, res) => {
  const followingId = parseInt(req.params.id);
  const { followerId } = req.body;
  
  if (!followerId) {
    return res.status(400).json({ error: '缺少followerId' });
  }
  
  const result = removeFollow(followerId, followingId);
  
  if (!result) {
    return res.status(400).json({ error: '未关注该用户' });
  }
  
  res.json({ message: '取消关注成功' });
});

router.get('/:id/followers', (req, res) => {
  const userId = parseInt(req.params.id);
  const { currentUserId } = req.query;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const followerIds = getFollowers(userId).map(f => f.followerId);
  const followers = users.filter(u => followerIds.includes(u.id));
  
  if (currentUserId) {
    const cid = parseInt(currentUserId);
    res.json(followers.map(u => ({
      ...u,
      isFollowing: isFollowing(cid, u.id),
      isMutualFollowing: isMutualFollowing(cid, u.id)
    })));
  } else {
    res.json(followers);
  }
});

router.get('/:id/following', (req, res) => {
  const userId = parseInt(req.params.id);
  const { currentUserId } = req.query;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const followingIds = getFollowing(userId).map(f => f.followingId);
  const following = users.filter(u => followingIds.includes(u.id));
  
  if (currentUserId) {
    const cid = parseInt(currentUserId);
    res.json(following.map(u => ({
      ...u,
      isFollowing: isFollowing(cid, u.id),
      isMutualFollowing: isMutualFollowing(cid, u.id)
    })));
  } else {
    res.json(following);
  }
});

function getLevelValue(level) {
  const levels = { beginner: 1, intermediate: 2, advanced: 3 };
  return levels[level] || 1;
}

router.get('/:id/dance-history', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const attendedDances = getUserAttendedDances(userId);
  res.json(attendedDances);
});

router.get('/:id/dance-stats', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const stats = getUserDanceStats(userId);
  res.json(stats);
});

module.exports = router;
