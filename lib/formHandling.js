'use strict';

const debug = require('debug')('mozilla-fenix-campaign:lib:formHandling');
const uuidv4 = require('uuid/v4');
const { IncomingForm } = require('formidable');

const fieldDefinition = require('../field_config.json');

module.exports = {
  parseForm,
};

function parseForm(req) {
  const form = new IncomingForm();

  return new Promise((resolve, reject) => {
    const formFields = {};
    const uniqueName = uuidv4();
    let csrfChecked = false;

    form.parse(req)
      .on('fileBegin', (name, file) => {
        if (!file.name) {
          return;
        }

        debug('INCOMING_REQUEST_FILE_BEGIN', file.name, file.type);
        file.extension = file.type && file.type.includes('/') && file.type.split('/')[1];
        file.path = `${__dirname}/../public/screenshots/${uniqueName}.${file.extension}`;
      })
      .on('field', (name, field) => {
        debug('INCOMING_REQUEST_FIELD', name, field);
        if (name === '_csrf') {
          if (req.session.csrf !== field) {
            return reject(new Error('INVALID_CSRF'));
          }

          csrfChecked = true;
          return;
        }

        if (name === 'github' && field && !field.startsWith('@')) {
          field = `@${field}`;
        }

        if (name == 'otherbrowser') {
          field = field === 'yes' ? '☒' : '☐';
        }

        formFields[name] = field;
      })
      .on('file', (name, file) => {
        if (!file.name) {
          return;
        }

        debug('INCOMING_REQUEST_FILE', name, file.path);
        formFields[name] = `${uniqueName}.${file.extension}`;
      })
      .on('aborted', () => {
        debug('INCOMING_REQUEST_ABORTED');
      })
      .on('error', (err) => {
        debug('INCOMING_REQUEST_ERROR', err);
        reject(err);
      })
      .on('end', () => {
        if (!csrfChecked) {
          return reject(new Error('NO_CSRF_CHECK_ABORTING'));
        }

        const allFieldsValidated = validateFields(formFields);
        if (!allFieldsValidated) {
          return reject(new Error('VALIDATION_FAILED'));
        }

        const preparedFields = prepareFieldsToArray(formFields);
        const sortedFields = preparedFields.sort(sortByConfigId);
        resolve(sortedFields);
      });
  });
}

function validateFields(fields) {
  return Object.keys(fieldDefinition).every((fieldKey) => {
    const definition = fieldDefinition[fieldKey];

    if (!definition) {
      console.error('NO_DEFINITION_FOUND_FOR', fieldKey);
      return false;
    }

    if (definition.required && !fields[fieldKey]) {
      return false;
    }

    const regex = new RegExp(definition.pattern, 'i');
    if (!regex.test(fields[fieldKey])) {
      return false;
    }

    return true;
  });
}

function prepareFieldsToArray(fields) {
  return Object.keys(fields).map((fieldKey) => {
    return {
      name: fieldKey,
      text: fields[fieldKey],
      config: fieldDefinition[fieldKey],
    };
  });
}

function sortByConfigId(a, b) {
  return a.config.id - b.config.id;
}