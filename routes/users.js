const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { 
  users, 
  getNextUserId, 
  isFollowing, 
  isMutualFollowing, 
  getFollowers, 
  getFollowing, 
  addFollow, 
  removeFollow 
} = db;

router.get('/', (req, res) => {
  const { style, level, role, city, currentUserId } = req.query;
  
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
    
    const following = isFollowing(userId, candidate.id);
    const mutual = following && isFollowing(candidate.id, userId);
    
    if (following) {
      score += 50;
    }
    
    return { 
      ...candidate, 
      matchScore: score,
      isFollowing: following,
      isMutualFollowing: mutual
    };
  });
  
  candidates.sort((a, b) => {
    if (b.isFollowing !== a.isFollowing) {
      return b.isFollowing ? 1 : -1;
    }
    return b.matchScore - a.matchScore;
  });
  
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

module.exports = router;
