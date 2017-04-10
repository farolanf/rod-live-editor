<?php
require_once 'node-render.php';

$content = <<<EOS
[
  {
    "name": "block-text",
    "text": "Text with 'single' and \"double\" quotes"
  }
]
EOS;

$moduleGroup = 'email-html';

echo renderContent($content, $moduleGroup)."\n";
?>