'use strict';

const assert = require('assert');
const _ = require('../public/libs/js/lodash.min');
const utils = require('../public/utils/content');

describe('content-utils', function() {
  it('should get instance', function() {
    const content = {
      id: 1,
      body: [
        {
          id: 2,
          content: [
            {
              id: 3,
              name: 'correct'
            },
            {
              id: 4,
              name: 'wrong'
            }
          ]
        }
      ]
    };
    const obj = utils.getInstance(3, content);
    assert.deepEqual(obj, {id: 3, name: 'correct'});
  });
});