const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const dancesRouter = require('./routes/dances');
const usersRouter = require('./routes/users');
const invitationsRouter = require('./routes/invitations');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/dances', dancesRouter);
app.use('/api/users', usersRouter);
app.use('/api/invitations', invitationsRouter);

app.get('/api', (req, res) => {
  res.json({
    message: '莎莎舞舞会信息聚合与舞伴邀约匹配平台 API',
    version: '1.0.0',
    endpoints: {
      dances: '/api/dances',
      users: '/api/users',
      invitations: '/api/invitations'
    }
  });
});

app.listen(PORT, () => {
  console.log(`莎莎舞平台服务器已启动: http://localhost:${PORT}`);
});
