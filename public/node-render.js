
const fs = require('fs');
const Renderer = require('./renderer');

const content = JSON.parse(process.argv[2]);
const moduleGroup = process.argv[3];

const modules = loadModules(moduleGroup);
const globals = loadGlobals();

const renderer = new Renderer(modules, globals);
console.log(renderer.render(content));

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

function loadGlobals() {
  let globals;
  const str = fs.readFileSync('./db/globals.js');
  eval(`globals = ${str}`);
  return globals;
}