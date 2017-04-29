
/**
 * Keeps data in one place.
 */
function Store() {

  const modules = new Modules();
  const content = new Content();

  return Object.assign(this, {
    modules,
    content,
    createRenderer,
  });

  /**
   * Create renderer using current state.
   */
  function createRenderer(language) {
    return new Renderer(modules.modules(), content.globalProperties(), language);
  }
}