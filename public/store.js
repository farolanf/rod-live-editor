
function Store() {

  const modules = new Modules();
  const content = new Content();

  return Object.assign(this, {
    modules,
    content,
    createRenderer,
  });

  function createRenderer() {
    return new Renderer(modules.modules(), content.globalProperties());
  }
}