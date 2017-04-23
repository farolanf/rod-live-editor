<?php

require_once './node-utils.php';

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

function _load_modules($dir) {
  $entries = array_filter(scandir($dir), function($val) {
    return $val !== '.' && $val !== '..';
  });
  $modules = file_contents(array_values($entries), $dir);
  return $modules;
}

function load_modules($name) {
  $modules = _load_modules(join('/', [__DIR__, 'modules', $name]));
  $system_modules = _load_modules(join('/', [__DIR__, 'system-modules']));
  return array_merge($system_modules, $modules);
}

/**
 * Get modules inside the group folder.
 *
 * A module is a js file, not a json one.
 *
 * @return json The array of modules.
*/
Flight::route('/api/module/group/@name', function($name) {
  Flight::json(load_modules($name));
});

/**
 * Precompile a given content.
 *
 * @param string content The content.
 * @param string precompileParameters The precompile parameters.
 */
function precompile($content, $precompileParameters) {
  // PRECOMPILE TEST
  if ($precompileParameters) {
    $content = NodeJsUtils::replaceBlocks($content);
  }
  else {
    // test without php comment
    $content = str_replace('Rod', '<?php get_user_name() ?>', $content);
    // test with php comments
    $content = str_replace('thanks for joining us', 
      '<?php get_opening() /* [Opening] */ ?>', $content);
    $content = str_replace('%gift%', '<?php get_gift_variable() /* [Gift] */?>', $content);
    $content = str_replace('on your desk', '<?php get_gift_place() /* [Gift Place] */?>', $content);
  }
  // PRECOMPILE TEST
  return $content;
}

/**
 * Load content from database.
 *
 * @param id The content id.
 */
function load_content($id) {
  // TODO: load content specified by id from database

  // {SAMPLE-- load sample content. Replace this sample with real code
  $file = join('/', [__DIR__, 'db/content', $id.'.js']);
  return file_get_contents($file);
  // SAMPLE}
}

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
  $content = load_content($id);
  $content = precompile($content, $precompileParameters);
  Flight::json($content);
});

/**
 * Precompile a given content.
 *
 * @param string content The content.
 * @param string precompileParameters The precompile parameters.
 */
Flight::route('POST /api/precompile', function() {
  $content = Flight::request()->data->content;
  $precompileParameters = Flight::request()->data->precompileParameters;
  $content = precompile(json_encode($content), $precompileParameters);
  Flight::json(json_decode($content));
});

function save($id, $content, $moduleGroup) {
  // TEST
  // file_put_contents(join('/', [__DIR__, 'db', $id.'-'.time().'.js']), $content);

    // join("\n", [$id, $content, $moduleGroup]));
  // TEST
}

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
  save($id, $content, $moduleGroup);
});

/**
 * Render a content with specified module group.
 * 
 * @param   string content The content javascript code to be rendered.
 * @param   string moduleGroup Module group to be used.
 * @return  string The renderered html.
*/
Flight::route('POST /api/render', function() {
  $req = Flight::request();
  $content = $req->data->content;
  $moduleGroup = $req->data->moduleGroup;
  $language = $req->data->language;
  echo NodeJsUtils::renderContent($content, $moduleGroup, $language);
});
?>