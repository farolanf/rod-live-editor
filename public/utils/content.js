
function getInstance(instanceId, content) {
  if (Array.isArray(content)) {
    for (const i in content) {
      const result = getInstance(instanceId, content[i]);
      if (result) {
        return result;
      }
    }
  }
  else if (content.id === instanceId) {
    return content;
  }
  else {
    for (const key in content) {
      const val = content[key];
      if (Array.isArray(val)) {
        const result = getInstance(instanceId, val);
        if (result) {
          return result;
        }        
      }
    }
  }
}

module.exports = {
  getInstance,
};