const assert = require('assert');
const _ = require('../libs/lodash.min');
const Editor = require('../utils/editor');

global._ = _;

describe('editor', function() {

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
    assert.deepEqual(instance, {id: 5, name: '5', parent: undefined,
      container: undefined});
  });

  it('should remove instance', function() {
    const instance = editor.removeInstance(5);
    assert.deepEqual(instance, {id: 5, name: '5', parent: undefined,
      container: undefined});
    assert.equal(editor.findInstance(5), null);
  });

  it('should move instance', function() {
    const parent = undefined;
    const container = undefined;
    const expected = [
      {id: 1, name: '1', parent, container},
      {id: 2, name: '2', parent, container},
      {
        id: 3, 
        name: '3',
        parent,
        container,
        body: [],
      },
      {
        id: 5, 
        name: '5',
        parent,
        container,
        content: [
          {
            id: 4, 
            name: '4',
            container: 'content',
          }
        ]
      },
    ];
    expected[3].content[0].parent = expected[3];
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

  it('should clone instance', function() {
    const parent = undefined;
    const container = undefined;
    const expected = [
      {id: 1, name: '1', parent, container},
      {id: 2, name: '2', parent, container},
      {
        id: 3, 
        name: '3',
        parent,
        container,
        body: [
          {id: 4, name: '4', container: 'body'},
          {id: 6, name: '4', container: 'body'},
        ]
      },
      {id: 5, name: '5', parent, container},
    ];
    expected[2].body[0].parent = expected[2];
    expected[2].body[1].parent = expected[2];
    
    editor.cloneInstance(4);
    assert.deepEqual(content, expected);
  });
});