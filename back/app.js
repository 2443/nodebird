const express = require('express');
const cors = require('cors');

const db = require('./models');
const passportConfig = require('./passport');

const app = express();
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const passport = require('./passport');

db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

passportConfig();

app.use(
  cors({
    origin: '*',
    credentials: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/post', postRouter);
app.use('/user', userRouter);

app.listen(3065, () => {
  console.log('서버 실행 중');
});
