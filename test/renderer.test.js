'use strict';

const EventEmitter = require('../public/libs/js/EventEmitter.min');
const assert = require('assert');
const _ = require('../public/libs/js/lodash.min');
const Renderer = require('../public/renderer');

global._ = _;
global.events = new EventEmitter();

global.config = {
  defaultLanguage: 'en',
};

describe('renderer', function() {

  const modules = {
    base: {
      output: '<span>%color% %_color% %color% %_color%</span>',
      properties: {
        color: {
          type: 'color',
          default: 'red',
          replace: {
            condition(val) {
              return !!val;
            },
            true: 'background: %value%;',
            false: ''
          }
        },
        _color: {
          alias: 'color',
          replace: {
            condition(val) {
              return !!val;
            },
            true: 'background="%value%"',
            false: ''
          }
        }
      }
    }
  };

  const globalProperties = {
      "color1": {type: 'color', value: "#eeeeee"},
      "color2": {type: 'color', value: "green"},
      "backgroundColorBody": {type: 'color', value: "white"},
      "backgroundColorFooter": {type: 'color', value: "blue"},
      "backgroundColor": {type: 'color', value: "#fff"},
      "hiddenPreheader": {type: 'text', value: "test"},

  };

  const renderer = new Renderer(modules, globalProperties);
  const content = [
    {
      id: 11,
      name: 'base',
      color: '%color1%',
    }
  ];

  it('should render correctly', function() {
    assert.equal(renderer.render(content, true), '<span>background: #eeeeee; background="#eeeeee" background: #eeeeee; background="#eeeeee"</span>');
  });

  it('should render meta correctly', function() {
    assert.equal(renderer.render(content), '<span data-id="11" data-name="base" data-visible="true">background: #eeeeee; background="#eeeeee" background: #eeeeee; background="#eeeeee"</span>');
  });

  it('should remove js comments', function() {
    const str = `some code /* some comments */ code following // comments
    some content
    // a comment
    code
    // another comment /* comments */`;
    const expectedStr = `some code  code following 
    some content
    
    code
    `;
    assert.equal(renderer.removeJsComments(str), expectedStr);
  });
});