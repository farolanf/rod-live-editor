'use strict';

const assert = require('assert');
const _ = require('../public/libs/js/lodash.min');
const Renderer = require('../public/renderer');

global._ = _;

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
    assert.equal(renderer.render(content), '<span data-id="11" data-name="base">background: #eeeeee; background="#eeeeee" background: #eeeeee; background="#eeeeee"</span>');
  });
});