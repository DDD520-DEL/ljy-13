const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { invitations, dances, users, getNextInvitationId, isFollowing, isMutualFollowing, addNotification, checkAndAwardBadges } = db;

router.get('/', (req, res) => {
  const { userId, danceId, status, currentUserId } = req.query;
  
  let filtered = [...invitations];
  
  if (userId) {
    const uid = parseInt(userId);
    filtered = filtered.filter(i => i.fromUserId === uid || i.toUserId === uid);
  }
  
  if (danceId) {
    filtered = filtered.filter(i => i.danceId === parseInt(danceId));
  }
  
  if (status) {
    filtered = filtered.filter(i => i.status === status);
  }
  
  const cid = currentUserId ? parseInt(currentUserId) : null;
  
  const result = filtered.map(inv => {
    const dance = dances.find(d => d.id === inv.danceId);
    const fromUser = users.find(u => u.id === inv.fromUserId);
    const toUser = users.find(u => u.id === inv.toUserId);
    
    let fromUserData = null;
    let toUserData = null;
    
    if (fromUser) {
      fromUserData = { id: fromUser.id, name: fromUser.name, avatar: fromUser.avatar };
      if (cid) {
        fromUserData.isFollowing = isFollowing(cid, fromUser.id);
        fromUserData.isMutualFollowing = isMutualFollowing(cid, fromUser.id);
      }
    }
    
    if (toUser) {
      toUserData = { id: toUser.id, name: toUser.name, avatar: toUser.avatar };
      if (cid) {
        toUserData.isFollowing = isFollowing(cid, toUser.id);
        toUserData.isMutualFollowing = isMutualFollowing(cid, toUser.id);
      }
    }
    
    return {
      ...inv,
      dance: dance ? { id: dance.id, title: dance.title, date: dance.date, venue: dance.venue } : null,
      fromUser: fromUserData,
      toUser: toUserData
    };
  });
  
  res.json(result);
});

router.get('/:id', (req, res) => {
  const { currentUserId } = req.query;
  const invitation = invitations.find(i => i.id === parseInt(req.params.id));
  if (!invitation) {
    return res.status(404).json({ error: '邀约不存在' });
  }
  
  const dance = dances.find(d => d.id === invitation.danceId);
  const fromUser = users.find(u => u.id === invitation.fromUserId);
  const toUser = users.find(u => u.id === invitation.toUserId);
  
  const cid = currentUserId ? parseInt(currentUserId) : null;
  
  let fromUserData = fromUser ? { ...fromUser } : null;
  let toUserData = toUser ? { ...toUser } : null;
  
  if (cid && fromUserData) {
    fromUserData.isFollowing = isFollowing(cid, fromUser.id);
    fromUserData.isMutualFollowing = isMutualFollowing(cid, fromUser.id);
  }
  
  if (cid && toUserData) {
    toUserData.isFollowing = isFollowing(cid, toUser.id);
    toUserData.isMutualFollowing = isMutualFollowing(cid, toUser.id);
  }
  
  res.json({
    ...invitation,
    dance,
    fromUser: fromUserData,
    toUser: toUserData
  });
});

router.post('/', (req, res) => {
  const { danceId, fromUserId, toUserId, message } = req.body;
  
  if (!danceId || !fromUserId || !toUserId) {
    return res.status(400).json({ error: '请填写必要信息' });
  }
  
  if (fromUserId === toUserId) {
    return res.status(400).json({ error: '不能向自己发起邀约' });
  }
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  const fromUser = users.find(u => u.id === fromUserId);
  const toUser = users.find(u => u.id === toUserId);
  if (!fromUser || !toUser) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const existing = invitations.find(i => 
    i.danceId === danceId && 
    i.fromUserId === fromUserId && 
    i.toUserId === toUserId &&
    i.status === 'pending'
  );
  
  if (existing) {
    return res.status(400).json({ error: '已存在待处理的邀约' });
  }
  
  const newInvitation = {
    id: getNextInvitationId(),
    danceId,
    fromUserId,
    toUserId,
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  invitations.push(newInvitation);
  
  const newBadges = checkAndAwardBadges(fromUserId);
  
  res.status(201).json({
    ...newInvitation,
    newlyEarnedBadges: newBadges
  });
});

router.put('/:id/accept', (req, res) => {
  const invitation = invitations.find(i => i.id === parseInt(req.params.id));
  if (!invitation) {
    return res.status(404).json({ error: '邀约不存在' });
  }
  
  if (invitation.status !== 'pending') {
    return res.status(400).json({ error: '只能接受待处理的邀约' });
  }
  
  invitation.status = 'accepted';
  
  const dance = dances.find(d => d.id === invitation.danceId);
  if (dance) {
    dance.attendeeCount++;
  }
  
  const toUser = users.find(u => u.id === invitation.toUserId);
  const danceInfo = dance ? dance.title : '舞会';
  addNotification(
    invitation.fromUserId,
    'invitation_accepted',
    '邀约已被接受',
    `${toUser ? toUser.name : '对方'} 接受了「${danceInfo}」的邀约`,
    invitation.id
  );
  
  const fromUserNewBadges = checkAndAwardBadges(invitation.fromUserId);
  const toUserNewBadges = checkAndAwardBadges(invitation.toUserId);
  
  res.json({
    ...invitation,
    newlyEarnedBadges: {
      fromUser: fromUserNewBadges,
      toUser: toUserNewBadges
    }
  });
});

router.put('/:id/reject', (req, res) => {
  const invitation = invitations.find(i => i.id === parseInt(req.params.id));
  if (!invitation) {
    return res.status(404).json({ error: '邀约不存在' });
  }
  
  if (invitation.status !== 'pending') {
    return res.status(400).json({ error: '只能拒绝待处理的邀约' });
  }
  
  invitation.status = 'rejected';
  
  const toUser = users.find(u => u.id === invitation.toUserId);
  const dance = dances.find(d => d.id === invitation.danceId);
  const danceInfo = dance ? dance.title : '舞会';
  addNotification(
    invitation.fromUserId,
    'invitation_rejected',
    '邀约已被拒绝',
    `${toUser ? toUser.name : '对方'} 拒绝了「${danceInfo}」的邀约`,
    invitation.id
  );
  
  res.json(invitation);
});

module.exports = router;
