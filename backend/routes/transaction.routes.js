const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middlewares');
router.post('/',authMiddleware.authMiddleware, )