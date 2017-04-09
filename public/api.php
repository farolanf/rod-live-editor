<?php

require_once './node-render.php';

function file_contents($files, $dir) {
  return array_map(function($file) use($dir) {
    return file_get_contents($dir.'/'.$file);
  }, $files);
}

Flight::route('/api/module/group', function() {
  $entries = array_filter(scandir('modules'), function($val) {
    return $val !== '.' && $val !== '..';
  });
  Flight::json(array_values($entries));
});

Flight::route('/api/module/group/@name', function($name) {
  $entries = array_filter(scandir('modules/'.$name), function($val) {
    return $val !== '.' && $val !== '..';
  });
  $dir = join('/', [__DIR__, 'modules', $name]);
  $modules = file_contents(array_values($entries), $dir);
  Flight::json($modules);
});

Flight::route('/api/content/@id', function($id) {
  // TODO: load content with id:$id from database
  // load sample content
  $file = join('/', [__DIR__, 'db', 'content.js']);
  $content = file_get_contents($file);
  $data = array('content' => json_encode($content));
  Flight::json($data);
});

Flight::route('POST /api/save', function() {
  $req = Flight::request();
  $id = $req->data->id;
  $content = $req->data->content;
  $moduleGroup = $req->data->moduleGroup;
  // TODO: save to db
  // save($id, $content, $moduleGroup);
});

/**
 * /api/render
 *
 * Renders content and returns the rendered HTML.
 * 
 * POST data:
 *   content - The content.
 *   moduleGroup - Module group name.
 *
 * Response: The renderered html.
*/
Flight::route('POST /api/render', function() {
  $req = Flight::request();
  $content = $req->data->content;
  $moduleGroup = $req->data->moduleGroup;
  echo renderContent($content, $moduleGroup);
});
?>