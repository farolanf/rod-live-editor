<?php
require_once './libs/flight/flight/Flight.php';
require_once './api.php';

Flight::route('/', function() {
  $q = Flight::request()->query;
  $id = $q->id;
  $moduleGroup = $q->moduleGroup;
  include 'app.html';
});

Flight::start();
?>