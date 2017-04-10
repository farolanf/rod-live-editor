<?php
function renderContent($content, $moduleGroup) {
  $content = escapeshellarg($content);
  exec('node -v 1>/dev/null', $output, $ret);
  if ($ret == 0) {
    exec("node node-render.js $content $moduleGroup", $output);
    return join($output);
  }
  return 'node failed';
}
?>