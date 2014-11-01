'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Simple Chat', subtitle: 'A test application' });
});

module.exports = router;
