<?php
require_once './libs/flight/flight/Flight.php';
require_once './api.php';

Flight::route('/', function() {
  // id and moduleGroup params will be handled 
  // on the client with rest api
  include 'app.html';
});

Flight::start();
?>