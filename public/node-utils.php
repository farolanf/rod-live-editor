<?php

class NodeJsUtils {

  const NODE_FAILED = 'NODE-FAILED';

  public static function nodeExists() {
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
  public static function renderContent($content, $moduleGroup, $language) {
    if (self::nodeExists()) {
      $content = escapeshellarg($content);
      $moduleGroup = escapeshellarg($moduleGroup);
      $language = escapeshellarg($language);
      $path = escapeshellarg(dirname(__FILE__) . '/node-render.js');
      exec("node $path $content $moduleGroup $language", $output);
      return join("\n", $output);
    }
    return self::NODE_FAILED;
  }

  /**
  * Replace block-include in content.
  *
  * @param string content The content code.
  * @return string The new content with replacements.
  */
  public static function replaceBlocks($content) {
    if (self::nodeExists()) {
      $content = escapeshellarg($content);
      $path = escapeshellarg(dirname(__FILE__) . '/node-replace-blocks.js');
      exec("node $path $content", $output);
      return join("\n", $output);
    }
    return self::NODE_FAILED;
  }
}
?>