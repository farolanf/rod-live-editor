<?php
function renderContent($content, $moduleGroup) {
  $content = escapeshellarg($content);
  exec("node node-render.js $content $moduleGroup", $output);
  return join($output);
}
?>