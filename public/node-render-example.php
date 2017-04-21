<?php
require_once 'node-utils.php';

$content = <<<EOS
{
  globalProperties: {
		color2: {type: 'color', 'value': 'green'},
    _color4: {
      alias: 'color2',
      replace: {
        condition: function(value) {
          return 'test';
        },
        test: function(value) {
          return 'black';
        }
      }
    },
  },
  data: [
    {
      name: 'block-text',
      text: 'Text with \\'single\\' and \"double\" quotes'
    },
    {
      name: 'block-text',
      text: 'The color is %_color4% not %color2%',
    }
  ]
}
EOS;

$moduleGroup = 'email-html';

// renderContent expects content array
echo renderContent($content, $moduleGroup)."\n";
?>