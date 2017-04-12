<?php
/**
 * Render content and output the HTML.
 *
 * @param array $content The content object.
 * @param string $moduleGroup The group folder name.
 * @return string The rendered HTML.
*/
function renderContent($content, $moduleGroup) {
  $content = escapeshellarg(json_encode($content));
  $moduleGroup = escapeshellarg($moduleGroup);
  // check nodejs existence
  exec('node -v 1>/dev/null', $output, $ret);
  if ($ret == 0) {
    exec("node node-render.js $content $moduleGroup", $output);
    return join($output);
  }
  return 'node failed';
}
?>