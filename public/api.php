<?php
Flight::route('/api/hello/@yo', function($yo) {
  echo 'hello '.$yo;
});
?>