const express = require('express');
const router = express.Router();
const db = require('../data/database');

const { addFeedback, getFeedbacks, VALID_FEEDBACK_TYPES } = db;

router.get('/', (req, res) => {
  const { type, userId } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (userId) filter.userId = userId;
  const feedbacks = getFeedbacks(filter);
  res.json(feedbacks);
});

router.get('/types', (req, res) => {
  res.json(VALID_FEEDBACK_TYPES);
});

router.post('/', (req, res) => {
  const { type, content, userId } = req.body;

  if (!type) {
    return res.status(400).json({ error: '请选择反馈类型' });
  }

  if (!VALID_FEEDBACK_TYPES.includes(type)) {
    return res.status(400).json({ error: '无效的反馈类型' });
  }

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: '请输入反馈内容' });
  }

  const result = addFeedback({
    type,
    content: content.trim(),
    userId: userId ? parseInt(userId) : null
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    message: '反馈提交成功',
    feedback: result.feedback
  });
});

module.exports = router;
