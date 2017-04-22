<?php

function node_exists() {
  // check nodejs existence
  exec('node -v 1>/dev/null', $output, $ret);
  return $ret == 0;
}

/**
 * Render content and output the HTML.
 *
 * @param string $content The content object.
 * @param string $moduleGroup The group folder name.
 * @return string The rendered HTML.
*/
function renderContent($content, $moduleGroup) {
  if (node_exists()) {
    $content = escapeshellarg($content);
    $moduleGroup = escapeshellarg($moduleGroup);
    $path = escapeshellarg(dirname(__FILE__) . '/node-render.js');
    exec("node $path $content $moduleGroup", $output);
    return join($output);
  }
  return 'node failed';
}

/**
 * Replace block-include in content.
 *
 * @param string content The content code.
 * @return string The new content with replacements.
 */
function replace_blocks($content) {
  if (node_exists()) {
    $content = escapeshellarg($content);
    exec("node node-replace-blocks.js $content", $output);
    return join("\n", $output);
  }
  return 'node failed';
}

?>