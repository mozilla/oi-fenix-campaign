'use strict';

const debug = require('debug')('mozilla-fenix-campaign:lib:githubBackend');
const Octokit = require('@octokit/rest');

const { GITHUB_TOKEN, OWNER, REPO, BASE_URL } = process.env;

if (!GITHUB_TOKEN || !OWNER || !REPO || !BASE_URL) {
  console.error('The following ENV variables need to be set: GITHUB_TOKEN, OWNER, REPO, BASE_URL');
  process.exit(1);
}

debug('GOT_ENV', process.env);

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

module.exports = {
  createIssue,
};

async function createIssue(fields) {
  debug('PREPARING_GITHUB_ISSUE');
  const text = prepareIssueText(fields);
  const type = fields.find((field) => field.name === 'type');
  debug('ISSUE_TYPE', type);

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
  debug('CREATED_ISSUE', result.data && result.data.number);
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
      text += `${fieldIssueLabelConfig.content}\n![Problem Screenshot](${BASE_URL}/screenshots/${fieldIssueText})\n\n`;
    } else {
      text += `${fieldIssueLabelConfig.content}${fieldIssueText}\n`;
    }
  });

  return text;
}