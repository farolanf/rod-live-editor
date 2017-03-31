function PropertyView(editor) {
  if (!(this instanceof PropertyView)) {
    return new PropertyView(editor);
  }

  let instanceId;

  return {
    setInstance(id) {instanceId = id; render()},
  };

  function render() {
    const instance = Instance(editor.findInstance(instanceId));
    const props = instance.getProperties();
    let html = '';
    _.forOwn(props, function(prop, key) {
      html += `
        <div class="list-group-item">
          <span class="name">${key}</span>
          <input class="form-control" value="${prop.value}" data-type="${prop.type}">
        </div>`;
    });
    $('#editor .property-view .list-group').html(html);
    $('.property-view [data-type="color"]').colorpicker();
  }
}