
/**
 * Renders content.
 * 
 * usage: node node-render.js <content> <moduleGroup>
 */

const fs = require('fs');
const Renderer = require('./renderer');

const content = JSON.parse(process.argv[2]);
const moduleGroup = process.argv[3];

const modules = loadModules(moduleGroup);

const renderer = new Renderer(modules, content.globalProperties);
console.log(renderer.render(content.data));

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
