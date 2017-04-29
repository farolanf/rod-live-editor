
const fs = require('fs');
const _ = require('./libs/js/lodash.min');
const utils = require('./utils/content');

let content = process.argv[2];
content = eval(`content = ${content}`);

replaceBlocks(content);
const js = utils.toJs(utils.getJSON(content));
console.log(js);

/**
 * Replace block-include with the specified content.
 * 
 * @param {object} content - The content.
 * @return {object} - The modified content.
 */
function replaceBlocks(content) {
  if (Array.isArray(content)) {
    content.forEach(function(val, i) {
      content[i] = replaceBlocks(val);
    });
  }
  else {
    if (content.name && content.name.startsWith('block-include')) {
      return loadContent(content.contentId, content.instanceId);
    }
    else {
      _.forOwn(content, function(val, key) {
        if (Array.isArray(val)) {
          content[key] = replaceBlocks(val);
        }
      });
    }
  }
  return content;
}

/**
 * Load content, merge global, and return the specified instance.
 * 
 * @param {string} contentId - Content id.
 * @param {string} instanceId - Instance id.
 * @return {object} - The instance.
 */
function loadContent(contentId, instanceId) {
  let content;
  eval(`content = ${_loadContent(contentId)}`);
  mergeGlobal(content.globalProperties);
  return utils.getInstance(instanceId, content.data);
}

/**
 * Load content from database.
 * 
 * @param {string} contentId - Content id.
 * @param {string} - The content code.
 */
function _loadContent(contentId) {
  // TODO: change to real content loader
  return fs.readFileSync(`db/content/${contentId}.js`);
}

/**
 * Merge loaded content's global properties to initial global properties.
 * 
 * Mege only if the property is not exists on the initial global properties.
 * 
 * @param {object} props - The loaded global properties. 
 */
function mergeGlobal(props) {
  _.forOwn(props, function(val, key) {
    if (!content.globalProperties.hasOwnProperty(key)) {
      content.globalProperties[key] = val;
    }
  });
}