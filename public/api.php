<?php

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

Flight::route('POST /api/save', function() {
  $req = Flight::request();
  $json = $req->data->content;
  echo $json;
});
?>