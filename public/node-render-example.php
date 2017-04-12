<?php
require_once 'node-render.php';

$content = <<<EOS
{
  "globalProperties": {
		"color1": {"type": "color", "value": "#eeeeee"},
		"color2": {"type": "color", "value": "green"},
		"backgroundColorBody": {"type": "color","value": "white"},
		"backgroundColorFooter": {"type": "color","value": "blue"},
		"backgroundColor": {"type": "color","value": "#fff"},
		"hiddenPreheader": {"type": "text","value": "test"}
  },
  "data": [
    {
      "name": "document-html-email"
    },
    {
      "name": "block-text",
      "text": "Text with 'single' and \"double\" quotes"
    }
  ]
}
EOS;

$moduleGroup = 'email-html';

echo renderContent($content, $moduleGroup)."\n";
?>