'use strict';

const uuidv4 = require('uuid/v4');

module.exports = {
  csrfProtection,
};

// in a perfect world we'd use csurf, but we need a major
// refactor to make this work with multipart forms (by using
// busboy for example)
function csrfProtection(req, res, next) {
  const secret = uuidv4();
  req.session.csrf = secret;
  console.log('setting csrf', secret);

  next();
}