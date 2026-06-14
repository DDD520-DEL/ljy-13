const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { getNotifications, getUnreadCount, markAsRead, markAllAsRead, users, dances } = db;

router.get('/', (req, res) => {
  const { userId, limit } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }
  
  const uid = parseInt(userId);
  let notifications = getNotifications(uid);
  
  if (limit) {
    notifications = notifications.slice(0, parseInt(limit));
  }
  
  const result = notifications.map(n => {
    const relatedData = {};
    
    if (n.type === 'invitation_accepted' || n.type === 'invitation_rejected') {
      const invitation = db.invitations.find(i => i.id === n.relatedId);
      if (invitation) {
        const dance = dances.find(d => d.id === invitation.danceId);
        const fromUser = users.find(u => u.id === invitation.fromUserId);
        relatedData.invitation = {
          id: invitation.id,
          dance: dance ? { id: dance.id, title: dance.title, date: dance.date } : null,
          fromUser: fromUser ? { id: fromUser.id, name: fromUser.name, avatar: fromUser.avatar } : null
        };
      }
    }
    
    return {
      ...n,
      ...relatedData
    };
  });
  
  res.json(result);
});

router.get('/unread-count', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }
  
  const count = getUnreadCount(parseInt(userId));
  res.json({ count });
});

router.put('/:id/read', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少 userId' });
  }
  
  const notificationId = parseInt(req.params.id);
  const success = markAsRead(notificationId, parseInt(userId));
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: '通知不存在' });
  }
});

router.put('/read-all', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '缺少 userId' });
  }
  
  markAllAsRead(parseInt(userId));
  res.json({ success: true });
});

module.exports = router;
