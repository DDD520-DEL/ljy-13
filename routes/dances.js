const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { SUPPORTED_CITIES, dances, getNextDanceId, isRegistered, addRegistration, removeRegistration, getRegisteredUsers, isRegistrationFull, isRegistrationClosed, getUserRegisteredDances, addNotification, isFavorited, addFavorite, removeFavorite, getFavoriteCount, getFavoritesByUser, checkins, isCheckedIn, checkIn, checkAndAwardBadges, getUserBadges, getAllVenues, getVenueByName, getVenueDances, getVenueStats } = db;

router.get('/cities', (req, res) => {
  res.json(SUPPORTED_CITIES);
});

router.get('/', (req, res) => {
  const { style, date, sort, city, page = 1, limit = 10, userId } = req.query;
  
  let filtered = [...dances];
  
  if (city) {
    filtered = filtered.filter(d => d.city === city);
  }
  
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
  
  const dataWithFavorites = paginated.map(dance => ({
    ...dance,
    isFavorited: userId ? isFavorited(parseInt(userId), dance.id) : false,
    favoriteCount: getFavoriteCount(dance.id)
  }));
  
  res.json({
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit),
    data: dataWithFavorites
  });
});

router.get('/hot', (req, res) => {
  const { limit = 5, city, userId } = req.query;
  let sorted = [...dances];
  if (city) {
    sorted = sorted.filter(d => d.city === city);
  }
  sorted = sorted.sort((a, b) => 
    (b.viewCount + b.attendeeCount * 2) - (a.viewCount + a.attendeeCount * 2)
  );
  const dataWithFavorites = sorted.slice(0, parseInt(limit)).map(dance => ({
    ...dance,
    isFavorited: userId ? isFavorited(parseInt(userId), dance.id) : false,
    favoriteCount: getFavoriteCount(dance.id)
  }));
  res.json(dataWithFavorites);
});

router.get('/:id', (req, res) => {
  const dance = dances.find(d => d.id === parseInt(req.params.id));
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  dance.viewCount++;
  
  const { userId } = req.query;
  const response = {
    ...dance,
    isFull: isRegistrationFull(dance.id),
    isClosed: isRegistrationClosed(dance.id),
    isRegistered: userId ? isRegistered(dance.id, parseInt(userId)) : false,
    isFavorited: userId ? isFavorited(parseInt(userId), dance.id) : false,
    favoriteCount: getFavoriteCount(dance.id)
  };
  
  res.json(response);
});

router.get('/:id/favorite-status', (req, res) => {
  const danceId = parseInt(req.params.id);
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少userId参数' });
  }
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  res.json({
    isFavorited: isFavorited(parseInt(userId), danceId),
    favoriteCount: getFavoriteCount(danceId)
  });
});

router.post('/:id/favorite', (req, res) => {
  const danceId = parseInt(req.params.id);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少userId' });
  }
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  const result = addFavorite(parseInt(userId), danceId);
  if (!result) {
    return res.status(400).json({ error: '已经收藏过该舞会' });
  }
  
  res.status(201).json({
    message: '收藏成功',
    favorite: result,
    favoriteCount: getFavoriteCount(danceId)
  });
});

router.delete('/:id/favorite', (req, res) => {
  const danceId = parseInt(req.params.id);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少userId' });
  }
  
  const result = removeFavorite(parseInt(userId), danceId);
  if (!result) {
    return res.status(400).json({ error: '未收藏该舞会' });
  }
  
  res.json({
    message: '已取消收藏',
    favoriteCount: getFavoriteCount(danceId)
  });
});

router.get('/user/:userId/favorites', (req, res) => {
  const userId = parseInt(req.params.userId);
  const favorites = getFavoritesByUser(userId);
  res.json(favorites);
});

router.post('/', (req, res) => {
  const { title, venue, address, city, date, startTime, endTime, styles, price, description, organizer, latitude, longitude, maxAttendees, registrationDeadline } = req.body;
  
  if (!title || !venue || !address || !city || !date || !startTime || !endTime || !styles || !styles.length) {
    return res.status(400).json({ error: '请填写必要信息' });
  }
  
  if (!SUPPORTED_CITIES.includes(city)) {
    return res.status(400).json({ error: '不支持的城市' });
  }
  
  const newDance = {
    id: getNextDanceId(),
    title,
    venue,
    address,
    city,
    date,
    startTime,
    endTime,
    styles,
    price: price || 0,
    description: description || '',
    organizer: organizer || '个人发布',
    latitude: latitude || 31.2304,
    longitude: longitude || 121.4737,
    maxAttendees: maxAttendees || null,
    registrationDeadline: registrationDeadline || null,
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
  
  if (req.body.city && !SUPPORTED_CITIES.includes(req.body.city)) {
    return res.status(400).json({ error: '不支持的城市' });
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

router.post('/:id/register', (req, res) => {
  const danceId = parseInt(req.params.id);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '请先选择身份' });
  }
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  if (isRegistrationClosed(danceId)) {
    return res.status(400).json({ error: '报名已截止' });
  }
  
  if (isRegistrationFull(danceId)) {
    return res.status(400).json({ error: '报名人数已满' });
  }
  
  if (isRegistered(danceId, userId)) {
    return res.status(400).json({ error: '您已报名该舞会' });
  }
  
  const registration = addRegistration(danceId, userId);
  if (!registration) {
    return res.status(500).json({ error: '报名失败' });
  }
  
  const registeredUsers = getRegisteredUsers(danceId);
  registeredUsers.forEach(user => {
    if (user.id !== userId) {
      const newUser = db.users.find(u => u.id === userId);
      if (newUser) {
        addNotification(
          user.id,
          'new_registration',
          '新舞者报名',
          `${newUser.name} 也报名了「${dance.title}」`,
          danceId
        );
      }
    }
  });
  
  res.status(201).json({
    message: '报名成功',
    registration,
    attendeeCount: dance.attendeeCount,
    isFull: isRegistrationFull(danceId)
  });
});

router.delete('/:id/register', (req, res) => {
  const danceId = parseInt(req.params.id);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '请先选择身份' });
  }
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  if (!isRegistered(danceId, userId)) {
    return res.status(400).json({ error: '您未报名该舞会' });
  }
  
  const success = removeRegistration(danceId, userId);
  if (!success) {
    return res.status(500).json({ error: '取消报名失败' });
  }
  
  res.json({
    message: '已取消报名',
    attendeeCount: dance.attendeeCount
  });
});

router.get('/:id/registered-users', (req, res) => {
  const danceId = parseInt(req.params.id);
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  const users = getRegisteredUsers(danceId);
  res.json(users);
});

router.get('/user/:userId/registered', (req, res) => {
  const userId = parseInt(req.params.userId);
  const dances = getUserRegisteredDances(userId);
  res.json(dances);
});

router.get('/:id/checkin-status', (req, res) => {
  const danceId = parseInt(req.params.id);
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少userId参数' });
  }
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  res.json({
    isCheckedIn: isCheckedIn(danceId, parseInt(userId))
  });
});

router.post('/:id/checkin', (req, res) => {
  const danceId = parseInt(req.params.id);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少userId' });
  }
  
  const uid = parseInt(userId);
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  if (isCheckedIn(danceId, uid)) {
    return res.status(400).json({ error: '您已签到过该舞会' });
  }
  
  const result = checkIn(danceId, uid);
  if (!result) {
    return res.status(500).json({ error: '签到失败' });
  }
  
  const newBadges = checkAndAwardBadges(uid);
  
  res.status(201).json({
    message: '签到成功',
    checkin: result,
    newlyEarnedBadges: newBadges
  });
});

router.get('/venues/list', (req, res) => {
  const { city } = req.query;
  let venues = getAllVenues();
  if (city) {
    venues = venues.filter(v => v.city === city);
  }
  res.json(venues.map(v => ({
    name: v.name,
    address: v.address,
    city: v.city,
    latitude: v.latitude,
    longitude: v.longitude,
    capacity: v.capacity,
    danceCount: v.danceCount
  })));
});

router.get('/venues/:name', (req, res) => {
  const venueName = decodeURIComponent(req.params.name);
  const venue = getVenueByName(venueName);
  
  if (!venue) {
    return res.status(404).json({ error: '场地不存在' });
  }
  
  const stats = getVenueStats(venueName);
  const dancesAtVenue = getVenueDances(venueName);
  
  res.json({
    name: venue.name,
    address: venue.address,
    city: venue.city,
    latitude: venue.latitude,
    longitude: venue.longitude,
    organizer: venue.organizer,
    capacity: venue.capacity,
    description: venue.description,
    stats: stats,
    dances: dancesAtVenue
  });
});

router.get('/venues/:name/dances', (req, res) => {
  const venueName = decodeURIComponent(req.params.name);
  const venue = getVenueByName(venueName);
  
  if (!venue) {
    return res.status(404).json({ error: '场地不存在' });
  }
  
  const { userId } = req.query;
  const dancesAtVenue = getVenueDances(venueName).map(dance => ({
    ...dance,
    isFavorited: userId ? isFavorited(parseInt(userId), dance.id) : false,
    favoriteCount: getFavoriteCount(dance.id)
  }));
  
  res.json(dancesAtVenue);
});

router.get('/venues/:name/stats', (req, res) => {
  const venueName = decodeURIComponent(req.params.name);
  const venue = getVenueByName(venueName);
  
  if (!venue) {
    return res.status(404).json({ error: '场地不存在' });
  }
  
  const stats = getVenueStats(venueName);
  res.json(stats);
});

module.exports = router;
