const assert = require('assert');
const editor = require('../utils/editor');

let content;

describe('utils', function() {

  beforeEach(function() {
    content = [
      {id: 1, name: '1'},
      {id: 2, name: '2'},
      {
        id: 3, 
        name: '3',
        body: [
          {id: 5, name: '5'}
        ]
      },
      {id: 4, name: '4'},
    ];
  });

  it('should find instance', function() {
    const instance = editor.findInstance(content, 5);
    assert.deepEqual(instance, {id: 5, name: '5'});
  });

  it('should remove instance', function() {
    const instance = editor.removeInstance(content, 5);
    assert.deepEqual(instance, {id: 5, name: '5'});
    assert(!editor.findInstance(content, 5));
  });

  it('should move instance', function() {
    const expected = [
      {id: 1, name: '1'},
      {id: 2, name: '2'},
      {
        id: 3, 
        name: '3',
        body: []
      },
      {
        id: 4, 
        name: '4',
        content: [
          {id: 5, name: '5'}
        ]
      },
    ];
    editor.moveInstance(content, 5, 4, 'content');
    assert.deepEqual(content, expected);
  });
});