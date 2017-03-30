function getContainerPlaceholder(name, parentId, children) {
  const containerJson = JSON.stringify({
    name: name,
    parentId: parentId
  });
  return `<!-- instance-container ${containerJson} --> ${children}`;
}

function injectInstanceData(str, id) {
  return str.replace(/(<.*?)>/, `$1 data-instance data-id="${id}">`);
}
