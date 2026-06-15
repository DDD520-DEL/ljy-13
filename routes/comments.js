const express = require('express');
const router = express.Router();
const db = require('../data/database');

let { comments, dances, users, getCommentsByDanceId, getCommentById, addComment, deleteComment, likeComment } = db;

function buildCommentTree(danceComments, sortBy = 'time') {
  const rootComments = danceComments.filter(c => !c.parentId);
  
  const sorted = rootComments.map(root => {
    const replies = danceComments
      .filter(c => c.parentId === root.id)
      .map(reply => enrichComment(reply))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    return {
      ...enrichComment(root),
      replies,
      replyCount: replies.length
    };
  });
  
  if (sortBy === 'hot') {
    sorted.sort((a, b) => (b.likeCount + b.replyCount * 2) - (a.likeCount + a.replyCount * 2));
  } else {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  return sorted;
}

function enrichComment(comment) {
  const user = users.find(u => u.id === comment.userId);
  const replyToUser = comment.replyToUserId 
    ? users.find(u => u.id === comment.replyToUserId) 
    : null;
  
  return {
    ...comment,
    user: user ? { id: user.id, name: user.name, avatar: user.avatar } : null,
    replyToUser: replyToUser ? { id: replyToUser.id, name: replyToUser.name, avatar: replyToUser.avatar } : null
  };
}

router.get('/dance/:danceId', (req, res) => {
  const danceId = parseInt(req.params.danceId);
  const { sort = 'time' } = req.query;
  
  const dance = dances.find(d => d.id === danceId);
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  const danceComments = getCommentsByDanceId(danceId);
  const result = buildCommentTree(danceComments, sort);
  const totalCount = danceComments.length;
  
  res.json({
    danceId,
    totalCount,
    comments: result
  });
});

router.post('/', (req, res) => {
  const { danceId, userId, content, parentId, replyToUserId } = req.body;
  
  if (!danceId || !userId || !content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }
  
  if (content.trim().length > 500) {
    return res.status(400).json({ error: '评论内容不能超过500字' });
  }
  
  const dance = dances.find(d => d.id === parseInt(danceId));
  if (!dance) {
    return res.status(404).json({ error: '舞会不存在' });
  }
  
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  let actualParentId = null;
  let actualReplyToUserId = null;
  
  if (parentId) {
    const parentComment = getCommentById(parentId);
    if (!parentComment) {
      return res.status(404).json({ error: '回复的评论不存在' });
    }
    if (parentComment.danceId !== parseInt(danceId)) {
      return res.status(400).json({ error: '评论不匹配' });
    }
    actualParentId = parentComment.parentId || parentComment.id;
    actualReplyToUserId = parentComment.userId;
    
    if (replyToUserId) {
      const targetUser = users.find(u => u.id === parseInt(replyToUserId));
      if (targetUser) {
        actualReplyToUserId = parseInt(replyToUserId);
      }
    }
  }
  
  const newComment = addComment({
    danceId,
    userId,
    content: content.trim(),
    parentId: actualParentId,
    replyToUserId: actualReplyToUserId
  });
  
  const result = enrichComment(newComment);
  res.status(201).json(result);
});

router.delete('/:id', (req, res) => {
  const commentId = parseInt(req.params.id);
  const { userId } = req.body;
  
  const comment = getCommentById(commentId);
  if (!comment) {
    return res.status(404).json({ error: '评论不存在' });
  }
  
  if (!userId) {
    return res.status(400).json({ error: '请提供用户ID' });
  }
  
  if (comment.userId !== parseInt(userId)) {
    return res.status(403).json({ error: '无权删除他人评论' });
  }
  
  const success = deleteComment(commentId);
  if (success) {
    res.json({ message: '删除成功' });
  } else {
    res.status(500).json({ error: '删除失败' });
  }
});

router.post('/:id/like', (req, res) => {
  const commentId = parseInt(req.params.id);
  
  const comment = likeComment(commentId);
  if (!comment) {
    return res.status(404).json({ error: '评论不存在' });
  }
  
  res.json({ message: '点赞成功', likeCount: comment.likeCount });
});

module.exports = router;
