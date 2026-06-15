const express = require('express');
const router = express.Router();
const db = require('../data/database');

let {
  users,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getUnreadMessageCount,
  getTotalUnreadCount,
  createConversationIfNotExists,
  getConversationByUsers,
  addNotification
} = db;

router.get('/conversations', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }

  const conversations = getUserConversations(userId);
  res.json(conversations);
});

router.get('/conversations/:id/messages', (req, res) => {
  const { userId } = req.query;
  const conversationId = parseInt(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }

  const messages = getConversationMessages(conversationId, userId);
  res.json(messages);
});

router.get('/unread-count', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }

  const count = getUnreadMessageCount(parseInt(userId));
  res.json({ count });
});

router.get('/total-unread', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }

  const count = getTotalUnreadCount(parseInt(userId));
  res.json({ count });
});

router.post('/send', (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  if (!content.trim()) {
    return res.status(400).json({ error: '消息内容不能为空' });
  }

  const result = sendMessage(senderId, receiverId, content.trim());

  if (!result) {
    return res.status(400).json({ error: '发送失败' });
  }

  const receiver = users.find(u => u.id === parseInt(receiverId));
  const sender = users.find(u => u.id === parseInt(senderId));
  if (receiver && sender) {
    addNotification(
      parseInt(receiverId),
      'new_message',
      '新消息',
      `${sender.name} 给你发了一条消息`,
      result.conversation.id
    );
  }

  res.status(201).json(result);
});

router.post('/conversation', (req, res) => {
  const { user1Id, user2Id } = req.body;

  if (!user1Id || !user2Id) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const conversation = createConversationIfNotExists(user1Id, user2Id);
  res.json(conversation);
});

router.get('/conversation-with/:otherUserId', (req, res) => {
  const { userId } = req.query;
  const otherUserId = parseInt(req.params.otherUserId);

  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }

  const conversation = getConversationByUsers(parseInt(userId), otherUserId);
  if (conversation) {
    res.json({ conversationId: conversation.id });
  } else {
    res.json({ conversationId: null });
  }
});

module.exports = router;
