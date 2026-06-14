const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { reviews, dances, users, getNextReviewId } = db;

function calculateAverageRatings(danceReviews) {
  if (danceReviews.length === 0) {
    return {
      venueAvg: 0,
      musicAvg: 0,
      organizationAvg: 0,
      overallAvg: 0,
      count: 0
    };
  }
  
  const venueSum = danceReviews.reduce((sum, r) => sum + r.venueRating, 0);
  const musicSum = danceReviews.reduce((sum, r) => sum + r.musicRating, 0);
  const orgSum = danceReviews.reduce((sum, r) => sum + r.organizationRating, 0);
  
  const venueAvg = venueSum / danceReviews.length;
  const musicAvg = musicSum / danceReviews.length;
  const organizationAvg = orgSum / danceReviews.length;
  const overallAvg = (venueAvg + musicAvg + organizationAvg) / 3;
  
  return {
    venueAvg: Math.round(venueAvg * 10) / 10,
    musicAvg: Math.round(musicAvg * 10) / 10,
    organizationAvg: Math.round(organizationAvg * 10) / 10,
    overallAvg: Math.round(overallAvg * 10) / 10,
    count: danceReviews.length
  };
}

router.get('/', (req, res) => {
  const { danceId, userId } = req.query;
  
  let filtered = [...reviews];
  
  if (danceId) {
    filtered = filtered.filter(r => r.danceId === parseInt(danceId));
  }
  
  if (userId) {
    filtered = filtered.filter(r => r.userId === parseInt(userId));
  }
  
  const result = filtered.map(review => {
    const dance = dances.find(d => d.id === review.danceId);
    const user = users.find(u => u.id === review.userId);
    return {
      ...review,
      dance: dance ? { id: dance.id, title: dance.title, date: dance.date, venue: dance.venue } : null,
      user: user ? { id: user.id, name: user.name, avatar: user.avatar } : null
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(result);
});

router.get('/dance/:danceId/average', (req, res) => {
  const danceId = parseInt(req.params.danceId);
  const danceReviews = reviews.filter(r => r.danceId === danceId);
  
  const averages = calculateAverageRatings(danceReviews);
  
  res.json({
    danceId,
    ...averages
  });
});

router.get('/:id', (req, res) => {
  const review = reviews.find(r => r.id === parseInt(req.params.id));
  if (!review) {
    return res.status(404).json({ error: '评价不存在' });
  }
  
  const dance = dances.find(d => d.id === review.danceId);
  const user = users.find(u => u.id === review.userId);
  
  res.json({
    ...review,
    dance,
    user
  });
});

router.post('/', (req, res) => {
  const { danceId, userId, venueRating, musicRating, organizationRating, comment } = req.body;
  
  if (!danceId || !userId || !venueRating || !musicRating || !organizationRating) {
    return res.status(400).json({ error: '请填写所有评分项' });
  }
  
  if (venueRating < 1 || venueRating > 5 || 
      musicRating < 1 || musicRating > 5 || 
      organizationRating < 1 || organizationRating > 5) {
    return res.status(400).json({ error: '评分必须在1-5之间' });
  }
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const existingReview = reviews.find(r => r.danceId === danceId && r.userId === userId);
  if (existingReview) {
    return res.status(400).json({ error: '您已经评价过这个舞会了' });
  }
  
  const newReview = {
    id: getNextReviewId(),
    danceId: parseInt(danceId),
    userId: parseInt(userId),
    venueRating: parseInt(venueRating),
    musicRating: parseInt(musicRating),
    organizationRating: parseInt(organizationRating),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  
  const result = {
    ...newReview,
    dance: { id: dance.id, title: dance.title, date: dance.date, venue: dance.venue },
    user: { id: user.id, name: user.name, avatar: user.avatar }
  };
  
  res.status(201).json(result);
});

router.put('/:id', (req, res) => {
  const index = reviews.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: '评价不存在' });
  }
  
  const { venueRating, musicRating, organizationRating, comment } = req.body;
  
  if (venueRating !== undefined && (venueRating < 1 || venueRating > 5)) {
    return res.status(400).json({ error: '场地评分必须在1-5之间' });
  }
  if (musicRating !== undefined && (musicRating < 1 || musicRating > 5)) {
    return res.status(400).json({ error: '音乐评分必须在1-5之间' });
  }
  if (organizationRating !== undefined && (organizationRating < 1 || organizationRating > 5)) {
    return res.status(400).json({ error: '组织评分必须在1-5之间' });
  }
  
  reviews[index] = { 
    ...reviews[index], 
    venueRating: venueRating !== undefined ? parseInt(venueRating) : reviews[index].venueRating,
    musicRating: musicRating !== undefined ? parseInt(musicRating) : reviews[index].musicRating,
    organizationRating: organizationRating !== undefined ? parseInt(organizationRating) : reviews[index].organizationRating,
    comment: comment !== undefined ? comment : reviews[index].comment,
    updatedAt: new Date().toISOString()
  };
  
  const review = reviews[index];
  const dance = dances.find(d => d.id === review.danceId);
  const user = users.find(u => u.id === review.userId);
  
  res.json({
    ...review,
    dance: dance ? { id: dance.id, title: dance.title, date: dance.date, venue: dance.venue } : null,
    user: user ? { id: user.id, name: user.name, avatar: user.avatar } : null
  });
});

router.delete('/:id', (req, res) => {
  const index = reviews.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: '评价不存在' });
  }
  
  const deleted = reviews.splice(index, 1);
  res.json({ message: '删除成功', review: deleted[0] });
});

module.exports = router;
