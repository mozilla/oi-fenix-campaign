'use strict';

const debug = require('debug')('mozilla-fenix-campaign:routes');
const express = require('express');
const middleware = require('../middleware');
const formHandling = require('../lib/formHandling');
const githubBackend = require('../lib/githubBackend');

const router = express.Router();

const { OWNER, REPO } = process.env;
const { csrfProtection } = middleware;

router.get('/', csrfProtection, async (req, res) => {
  debug('INCOMING_REQUEST_INDEX');
  const issue = `https://github.com/${OWNER}/${REPO}/issues/${req.query.issue}`
  res.render('index', {
    success: /true/.test(req.query.success),
    submitted: /true/.test(req.query.submitted),
    issue,
    csrf: req.session.csrf,
  });
});

router.post('/create', async (req, res) => {
  debug('INCOMING_REQUEST_CREATE');
  try {
    const fields = await formHandling.parseForm(req);
    const issueInfo = await githubBackend.createIssue(fields);
    const issueNumber = issueInfo && issueInfo.data && issueInfo.data.number;
    debug('ISSUE_CREATED_REDIRECTING_BACK', issueNumber);
    res.redirect(`/?success=true&submitted=true&issue=${issueNumber}`);
  } catch(error) {
    debug('OH_NO_COULD_NOT_CREATE', error.message);
    res.redirect('/?success=false&submitted=true');
  }
});

module.exports = router;
