const express = require('express');
const router = express.Router();
const main_controller = require('./main_controller');

router.post('/shorten',main_controller.shorten);

router.get('/:short_code',main_controller.redirect);

module.exports = router;