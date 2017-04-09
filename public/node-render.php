<?php
function renderContent($content, $moduleGroup) {
  exec("node node-render.js '$content' $moduleGroup", $output);
  return join($output);
}
?>