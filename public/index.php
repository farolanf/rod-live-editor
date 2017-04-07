<?php
require_once './libs/flight/flight/Flight.php';
require_once './api.php';

Flight::route('/', function() {
  include 'app.html';
});

Flight::start();
?>