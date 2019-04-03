'use strict';

const debug = require('debug')('mozilla-fenix-campaign:lib:githubBackend');
const Octokit = require('@octokit/rest');
const fieldConfig = require('../field_config.json');

const { GITHUB_TOKEN, OWNER, REPO } = process.env;

if (!GITHUB_TOKEN || !OWNER || !REPO) {
  console.error('The following ENV variables need to be set: GITHUB_TOKEN, OWNER, REPO');
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

module.exports = {
  createIssue,
};

async function createIssue(fields) {
  debug('CREATING_GITHUB_ISSUE');
  const text = prepareIssueText(fields);
  const issueParams = {
    owner: OWNER,
    repo: REPO,
    title: 'TO BE DONE',
    body: text,
    labels: ['triage'],
  }
  const result = await octokit.issues.create(issueParams);
  return result;
}

function prepareIssueText(fields) {
  let text = '';

  Object.keys(fields).map((fieldKey) => {
    const fieldIssueLabelConfig = fieldConfig[fieldKey];
    const fieldIssueText = fields[fieldKey];

    if (!fieldIssueText) {
      return;
    }

    if (fieldIssueLabelConfig && fieldIssueLabelConfig.heading) {
      text += `${fieldIssueLabelConfig.content}\n${fieldIssueText}\n\n`;
    } else if (fieldIssueLabelConfig && fieldIssueLabelConfig.image) {
      // text += `\n\n![Problem Screenshot](http://localhost:4000/screenshots/${fields[fieldKey]})`;
      text += `\n\n![Problem Screenshot](https://www.mozilla.org/media/img/firefox/accounts/fxa-hero-img-high-res.22dc4f0026fc.png)`; // FIXME: path..
    } else {
      text += `${fieldIssueLabelConfig.content}${fieldIssueText}\n`;
    }
  });

  return text;
}