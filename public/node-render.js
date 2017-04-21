'use strict';

/**
 * Renders content.
 * 
 * usage: node node-render.js <content> <moduleGroup>
 */

const fs = require('fs');
const Renderer = require('./renderer');

const code = process.argv[2];
const moduleGroup = process.argv[3];

let content;
eval(`content = ${code}`);
const modules = loadModules(moduleGroup);

const renderer = new Renderer(modules, content.globalProperties);
console.log(renderer.render(content.data, true));

/**
 * Load modules from the modules/<group> folder.
 * 
 * Each module is a js, not a json file. This is to avoid tedious
 * quotes escaping on writing in json.
 * 
 * @param {string} group - The group folder name.
 * @return {array} - The array of module objects.
 */
function loadModules(group) {
  const modules = {};
  const files = fs.readdirSync(`./modules/${group}`);
  files.forEach(function(file) {
    const modstr = fs.readFileSync(`./modules/${group}/${file}`);
    let mod;
    eval(`mod = ${modstr}`);
    modules[mod.name] = mod;
  });
  return modules;
}
