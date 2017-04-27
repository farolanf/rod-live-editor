{
  name: 'error-module',
  output: '%test%',
  properties: {
    test: {
      type: 'text',
      default: 'hello',
    },
    _test: {
      alias: 'test',
      replace: {
        condition: function(value) {
          return 'not-exists';
        }
      }
    }
  }
}