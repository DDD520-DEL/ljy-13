const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { dances, getNextDanceId } = db;

router.get('/', (req, res) => {
  const { style, date, sort, page = 1, limit = 10 } = req.query;
  
  let filtered = [...dances];
  
  if (style) {
    filtered = filtered.filter(d => d.styles.includes(style));
  }
  
  if (date) {
    filtered = filtered.filter(d => d.date === date);
  }
  
  if (sort === 'hot') {
    filtered.sort((a, b) => (b.viewCount + b.attendeeCount * 2) - (a.viewCount + a.attendeeCount * 2));
  } else if (sort === 'date') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sort === 'price') {
    filtered.sort((a, b) => a.price - b.price);
  }
  
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  res.json({
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit),
    data: paginated
  });
});

router.get('/hot', (req, res) => {
  const { limit = 5 } = req.query;
  const sorted = [...dances].sort((a, b) => 
    (b.viewCount + b.attendeeCount * 2) - (a.viewCount + a.attendeeCount * 2)
  );
  res.json(sorted.slice(0, parseInt(limit)));
});

router.get('/:id', (req, res) => {
  const dance = dances.find(d => d.id === parseInt(req.params.id));
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  dance.viewCount++;
  res.json(dance);
});

router.post('/', (req, res) => {
  const { title, venue, address, date, startTime, endTime, styles, price, description, organizer, latitude, longitude } = req.body;
  
  if (!title || !venue || !address || !date || !startTime || !endTime || !styles || !styles.length) {
    return res.status(400).json({ error: '请填写必要信息' });
  }
  
  const newDance = {
    id: getNextDanceId(),
    title,
    venue,
    address,
    date,
    startTime,
    endTime,
    styles,
    price: price || 0,
    description: description || '',
    organizer: organizer || '个人发布',
    latitude: latitude || 31.2304,
    longitude: longitude || 121.4737,
    viewCount: 0,
    attendeeCount: 1,
    createdAt: new Date().toISOString()
  };
  
  dances.unshift(newDance);
  res.status(201).json(newDance);
});

router.put('/:id', (req, res) => {
  const index = dances.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  dances[index] = { ...dances[index], ...req.body, id: dances[index].id };
  res.json(dances[index]);
});

router.delete('/:id', (req, res) => {
  const index = dances.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  const deleted = dances.splice(index, 1);
  res.json({ message: '删除成功', dance: deleted[0] });
});

module.exports = router;
