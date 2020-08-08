const express = require('express');
const router = express.Router();
const { Post, Comment, Image, User } = require('../models');
const { isNotLoggedIn } = require('./middleware');

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: {
            model: User,
            attributes: ['id', 'nickname'],
            order: [['createdAt', 'DESC']],
          },
        },
        {
          model: User,
          as: 'Likers',
          attributes: ['id'],
        },
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
