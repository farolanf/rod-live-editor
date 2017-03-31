const assert = require('assert');
const _ = require('../libs/lodash.min');
const Editor = require('../utils/editor');

global._ = _;

describe('utils', function() {

  let editor;
  let content;

  beforeEach(function() {
    content = [
      {id: 1, name: '1'},
      {id: 2, name: '2'},
      {
        id: 3, 
        name: '3',
        body: [
          {id: 4, name: '4'}
        ]
      },
      {id: 5, name: '5'},
    ];
    editor = Editor(content);
  });

  it('should find instance', function() {
    const instance = editor.findInstance(5);
    assert.deepEqual(instance, {id: 5, name: '5'});
  });

  it('should remove instance', function() {
    const instance = editor.removeInstance(5);
    assert.deepEqual(instance, {id: 5, name: '5'});
    assert.equal(editor.findInstance(5), null);
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
        id: 5, 
        name: '5',
        content: [
          {id: 4, name: '4'}
        ]
      },
    ];
    editor.moveInstance(4, 5, 'content');
    assert.deepEqual(content, expected);
  });

  it('should regenerate ids', function() {
    const instance = {
      id: 1, 
      name: '1',
      body: [
        {id: 2, name: '2'}
      ]
    };
    const expected = {
      id: 3, 
      name: '1',
      body: [
        {id: 4, name: '2'}
      ]
    };
    editor = Editor();
    editor.newInstanceId = 3;
    editor.regenerateId(instance);
    assert.deepEqual(instance, expected);
  });
});