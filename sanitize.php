<?php
function sanitizeString($type, $field) {
  if ($type == INPUT_POST) {

    if (isset($_POST[$field])) {
      return htmlspecialchars(strip_tags($_POST[$field]));
    }

  } else if ($type == INPUT_GET) {

    if (isset($_GET[$field])) {
      return htmlspecialchars(strip_tags($_GET[$field]));
    }

  } else { // $type is assumed to be INPUT_SERVER

    if (isset($_SERVER[$field])) {
      return htmlspecialchars(strip_tags($_SERVER[$field]));
    }

  }
}