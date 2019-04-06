'use strict';

const debug = require('debug')('mozilla-fenix-campaign:lib:githubBackend');
const Octokit = require('@octokit/rest');

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
  const type = fields.find((field) => field.name === 'type');

  if (!text) {
    throw new Error('TEXT_INVALID');
  }

  const issueParams = {
    owner: OWNER,
    repo: REPO,
    title: type.text,
    body: text,
    labels: ['triage'],
  }

  const result = await octokit.issues.create(issueParams);
  return result;
}

function prepareIssueText(fields) {
  let text = '';

  fields.map((field) => {
    const fieldIssueLabelConfig = field.config;
    const fieldIssueText = field.text;

    if (!fieldIssueText) {
      return;
    }

    if (fieldIssueLabelConfig && fieldIssueLabelConfig.heading) {
      text += `${fieldIssueLabelConfig.content}\n${fieldIssueText}\n\n`;
    } else if (fieldIssueLabelConfig && fieldIssueLabelConfig.image) {
      // text += `\n\n![Problem Screenshot](http://localhost:4000/screenshots/${fieldIssueText})`;
      text += `${fieldIssueLabelConfig.content}\n![Problem Screenshot](https://www.mozilla.org/media/img/firefox/accounts/fxa-hero-img-high-res.22dc4f0026fc.png)\n\n`; // FIXME: path..
    } else {
      text += `${fieldIssueLabelConfig.content}${fieldIssueText}\n`;
    }
  });

  return text;
}