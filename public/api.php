<?php

require_once './node-render.php';

/**
 * Get file contents from a list of files.
 *
 * @internal
 * @return array Array of file contents.
*/
function file_contents($files, $dir) {
  return array_map(function($file) use($dir) {
    return file_get_contents($dir.'/'.$file);
  }, $files);
}

/**
 * Get sub folders of modules/.
 *
 * @return json The array of sub folders.
*/
Flight::route('/api/module/group', function() {
  $entries = array_filter(scandir('modules'), function($val) {
    return $val !== '.' && $val !== '..';
  });
  Flight::json(array_values($entries));
});

/**
 * Get modules inside the group folder.
 *
 * A module is a js file, not a json one.
 *
 * @return json The array of modules.
*/
Flight::route('/api/module/group/@name', function($name) {
  $entries = array_filter(scandir('modules/'.$name), function($val) {
    return $val !== '.' && $val !== '..';
  });
  $dir = join('/', [__DIR__, 'modules', $name]);
  $modules = file_contents(array_values($entries), $dir);
  Flight::json($modules);
});

/**
 * Get content specified by id.
 *
 * A content is an object which has properties: 
 * - globalProperties
 * - data
 *
 * @return json The content as json.
*/
Flight::route('/api/content/@id', function($id) {
  $precompileParameters = Flight::request()->query->precompileParameters;

  // TODO: load content specified by id from database
  
  // {SAMPLE-- load sample content. Replace this sample with real code
  $file = join('/', [__DIR__, 'db', 'content.js']);
  $content = file_get_contents($file);
  // SAMPLE}

  // PRECOMPILE TEST
  if (!$precompileParameters) {
    // test without php comment
    $content = str_replace('Hi Rod', '<?php get_user_name() ?>', $content);
    // test with php comments
    $content = str_replace('thanks for joining us', 
      '<?php get_opening() /* [Opening] */ ?>', $content);
    $content = str_replace('your mac', '<?php get_gift_name() /* [Gift] */?>', $content);
    $content = str_replace('on your desk', '<?php get_gift_place() /* [Gift Place] */?>', $content);
  }
  // PRECOMPILE TEST

  Flight::json($content);
});

/**
 * Save a document.
 *
 * A content is an object which has properties: 
 * - globalProperties
 * - data
 *
 * @param string id The id of document.
 * @param json content The content.
 * @param string moduleGroup Current module group in use.
*/
Flight::route('POST /api/save', function() {
  $req = Flight::request();
  $id = $req->data->id;
  $content = $req->data->content;
  $moduleGroup = $req->data->moduleGroup;
  $precompileParameters = $req->data->precompileParameters;

  // DEBUG
  // echo join("\n", [$id, json_encode($content), $moduleGroup, $precompileParameters]);
  // DEBUG

  // TODO: save to db
  // save($id, $content, $moduleGroup);
});

/**
 * Render a content with specified module group.
 * 
 * @param   json content The content to be rendered.
 * @param   string moduleGroup Module group to be used.
 * @return  string The renderered html.
*/
Flight::route('POST /api/render', function() {
  $req = Flight::request();
  $content = $req->data->content;
  $moduleGroup = $req->data->moduleGroup;
  echo renderContent($content, $moduleGroup);
});
?>