'use strict';

const assert = require('assert');
const _ = require('../libs/lodash.min');
const Renderer = require('../renderer');
const Editor = require('../utils/editor');

global._ = _;

describe('renderer', function() {

  const modules = {
    base: {
      output: '%color% %_color% %color% %_color%',
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
      "color1": "#eeeeee",
      "color2": "green",
      "backgroundColorBody": "white",
      "backgroundColorFooter": "blue",
      "backgroundColor": "#fff",
      "hiddenPreheader": "test",

  };

  const renderer = new Renderer(modules, globalProperties);
  const content = [
    {
      name: 'base',
      color: '%color1%',
    }
  ];

  it('should render correctly', function() {
    assert.equal(renderer.render(content), 'background: #eeeeee; background="#eeeeee" background: #eeeeee; background="#eeeeee"');
  });
});