'use strict';

const debug = require('debug')('mozilla-fenix-campaign:lib:formHandling');
const uuidv4 = require('uuid/v4');
const { IncomingForm } = require('formidable');

module.exports = {
  parseForm,
};

function parseForm(req) {
  const form = new IncomingForm();

  return new Promise((resolve, reject) => {
    const formFields = {};
    const uniqueName = uuidv4();

    form.parse(req)
      .on('fileBegin', (name, file) => {
        debug('INCOMING_REQUEST_FILE_BEGIN', file);
        const extension = file.type && file.type.includes('/') && file.type.split('/')[1];
        file.path = `${__dirname}/../public/screenshots/${uniqueName}.${extension}`;
      })
      .on('field', (name, field) => {
        debug('INCOMING_REQUEST_FIELD', name, field);
        formFields[name] = field;
      })
      .on('file', (name, file) => {
        debug('INCOMING_REQUEST_FILE', name, file.path);
        formFields['upload'] = uniqueName;
      })
      .on('aborted', () => {
        debug('INCOMING_REQUEST_ABORTED');
      })
      .on('error', (err) => {
        debug('INCOMING_REQUEST_ERROR', err);
        reject(err);
      })
      .on('end', () => {
        resolve(formFields);
      });
  });
}