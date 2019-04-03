'use strict';

const debug = require('debug')('mozilla-fenix-campaign:routes');
const express = require('express');
const formHandling = require('../lib/formHandling');
const githubBackend = require('../lib/githubBackend');

const router = express.Router();

router.get('/', async (req, res) => {
  debug('INCOMING_REQUEST_INDEX');
  res.render('index', {});
});

router.post('/create', async (req, res) => {
  debug('INCOMING_REQUEST_CREATE');
  try {
    const fields = await formHandling.parseForm(req);
    const issueInfo = await githubBackend.createIssue(fields);
    // TODO: redirect to form again with "thanks" and link to issue
    res.json({ success: true, fields, issueInfo });
  } catch(error) {
    res.json({ success: false, error });
  }
});

module.exports = router;
