SandBox.interface = {};

SandBox.interface.incrementCounter = function(type) {
  // STUB
}

SandBox.interface.displayError = function(msg) {
  // STUB
}

SandBox.interface.showPane = function(id) {
  // STUB
}

SandBox.interface.appendLog = function(data) {
  // STUB
}

SandBox.interface.appendRecord = function(columns) {
  // STUB
} 

SandBox.interface.queryHolder = function() {
  // STUB
}

SandBox.interface.queryString = function() {
  // STUB
}

SandBox.interface.setQueryString = function(f) {
  // STUB
}

SandBox.interface.clearData = function() { 
  // STUB
}

SandBox.interface.setHeader = function(schema) {
  // STUB
} 

SandBox.interface.taskButton = function() {
  if (! jQuery('#button').length > 0) {
    $('body').append('<div id="button">Click me!</div>');
  }
  return jQuery('#button');
}

SandBox.interface.taskButton.readsStart = function() {
  // STUB
}

SandBox.interface.taskButton.setStart = function() {
  return true;
  // STUB
} 

SandBox.interface.taskButton.setRunning = function() {
  // STUB
} 

SandBox.interface.taskButton.setSuccess = function() {
  // STUB
}

module.exports = SandBox.interface;
