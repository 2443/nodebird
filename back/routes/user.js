const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const { User, Post } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middleware');
const db = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  if (req.user) {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.user.id },
      attributes: {
        exclude: ['password'],
      },
      include: [
        {
          model: Post,
          attributes: ['id'],
        },
        { model: User, as: 'Followings', attributes: ['id'] },
        {
          model: User,
          as: 'Followers',
          attributes: ['id'],
        },
      ],
    });
    res.status(200).json(fullUserWithoutPassword);
  } else {
    res.status(200).json(null);
  }
});

router.get('/:userId', async (req, res, next) => {
  const fullUserWithoutPassword = await User.findOne({
    where: { id: req.params.userId },
    attributes: {
      exclude: ['password'],
    },
    include: [
      {
        model: Post,
        attributes: ['id'],
      },
      { model: User, as: 'Followings', attributes: ['id'] },
      {
        model: User,
        as: 'Followers',
        attributes: ['id'],
      },
    ],
  });
  if (fullUserWithoutPassword) {
    const data = fullUserWithoutPassword.toJson();
    data.Posts = data.Posts.length;
    data.Followers = data.Followers.length;
    data.Followings = data.Followings.length;
    return res.status(200).json(fullUserWithoutPassword);
  } else {
    return res.status(403).send('존재하지 않는 사용자입니다.');
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: Post,
          },
          { model: User, as: 'Followings' },
          {
            model: User,
            as: 'Followers',
          },
        ],
      });
      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next);
});

router.post('/', isNotLoggedIn, async (req, res, next) => {
  try {
    const { email, nickname, password } = req.body;

    const exUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: email,
      nickname: nickname,
      password: hashedPassword,
    });
    res.send('ok');
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      {
        where: { id: req.user.id },
      }
    );
    res.status(200).json({ nickname: req.body.nickname });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.userId },
    });
    if (!user) {
      return res.status(403).send('없는 사람을 팔로우 하려고 하시네요?');
    }
    await user.addFollower(req.user.id);
    res.status(200).json({ UserId: user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.userId },
    });
    if (!user) {
      return res.status(403).send('없는 사람을 언팔로우 하려고 하시네요?');
    }
    await user.removeFollower(req.user.id);
    res.status(200).json({ UserId: user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.userId },
    });
    if (!user) {
      return res.status(403).send('없는 사람을 차단 하려고 하시네요?');
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    const followers = await user.getFollowers();
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    const followings = await user.getFollowings();
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
