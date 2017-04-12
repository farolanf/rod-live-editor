<?php
require_once 'node-render.php';

$content = <<<EOS
{
  "globalProperties": {
		"color1": {"type": "color", "value": "#eeeeee"},
		"color2": {"type": "color", "value": "green"},
		"color3": {"type": "color", "value": "red"},
		"backgroundColorBody": {"type": "color","value": "white"},
		"backgroundColorFooter": {"type": "color","value": "blue"},
		"backgroundColor": {"type": "color","value": "#fff"},
		"hiddenPreheader": {"type": "text","value": "test"}
  },
  "data": [
    {
      "name": "document-html-email",
      "backgroundColorHeader": "%color3%"
    },
    {
      "name": "block-text",
      "text": "Text with 'single' and \"double\" quotes"
    }
  ]
}
EOS;

$moduleGroup = 'email-html';

// renderContent expects content array
echo renderContent(json_decode($content), $moduleGroup)."\n";
?>