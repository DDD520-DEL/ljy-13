const express = require('express');
const router = express.Router();
const db = require('../data/database');

const { getPlatformStats } = db;

router.get('/', (req, res) => {
  const stats = getPlatformStats();
  res.json(stats);
});

module.exports = router;
