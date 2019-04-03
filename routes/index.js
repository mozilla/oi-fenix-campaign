'use strict';

const debug = require('debug')('mozilla-fenix-campaign:routes');
const express = require('express');
const formHandling = require('../lib/formHandling');
const router = express.Router();

router.get('/', async (req, res) => {
  debug('INCOMING_REQUEST_INDEX');
  res.render('index', {});
});

router.post('/create', (req, res) => {
  debug('INCOMING_REQUEST_CREATE');
  formHandling.parseForm(req)
    .then((fields) => {
      res.json({ success: true, fields });
    })
    .catch((err) => {
      res.json({ success: false, err });
    });
});

module.exports = router;
