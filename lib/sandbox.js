// @Description: Declaration of Object
var SandBox = function(socket_host, socket_options, interface) {
  var self = this;
  self.interface = interface;
  self.setupSocket(socket_host, socket_options);
  self.setDocumentEventListeners();
};

// @Description: Sets up the socket connection to the backend server
SandBox.prototype.setupSocket = function(socket_host, socket_options) {
  var self = this;
  self.socket = io.connect(socket_host, socket_options);
  self.setSocketEventListeners();
};

// @Description: Sets up the listeners for socket events emitted from the server
SandBox.prototype.setSocketEventListeners = function() {
  var self = this;
  self.socket.on('connected', function(data) {
    self.addToLog('Connection to Test Server established');
  });
  
  self.socket.on('set task_queue_id', function(task_queue_id) {
    self.task_queue_id = task_queue_id;
  });
  
  self.socket.on('interim results returned', function(data){
    self.addToLog(data);
  });
  
  self.socket.on('json results returned', function(data){
    self.addDataRow(data);
    if(self.prepare_to_switch_pane) {
      self.prepare_to_switch_pane = false;
      self.interface.showPane('datatable');
    }
  });
  
  self.socket.on('testing completed', function(data) {
    self.stopScraping();
    self.state3();
  });      
};

// @Description: Sets up the listeners for DOM events on the document
SandBox.prototype.setDocumentEventListeners = function() {
  var self = this;
  self.state1();
  
  // When user clicks on the Start scraping button
  self.interface.taskButton().click(function() {
    if(!self.socket) {
      self.setupSocket();
    }
    
    // Starts the scraping operation
    if(self.interface.taskButton.readsStart()) {
      self.prepare_to_switch_pane = true;
      self.interface.showPane('logs'); 
      self.clearDisplay();
      query_json_obj = self.getJsonQueryObject();

      self.verifyDefinition(query_json_obj, function(is_valid, error_msg) {
        if(is_valid) {
          self.startScraping(query_json_obj);
          self.state2();
        } else {
          self.interface.displayError(error_msg);
          self.interface.showPane('edit');
          self.state1();
        }
      });
      
    // Stops the scraping operation
    } else {
      self.prepare_to_switch_pane = true;
      self.interface.showPane('edit');
      self.stopScraping();
      self.state1();
    }
    
    // Stops the form from being posted
    return false;

  });
  
};

// @Description: Gets the JSON query object user input from the query input box.
// @return: JSON Object || false
SandBox.prototype.getJsonQueryObject = function () {
  var self = this;  
  data = self.interface.queryString();
  try {
    data_obj = KSON.parse(data);
  } catch(exception) {
    try {
      eval ('data_obj = ' + data)
    } catch(exception) {
      return false;
    }
  }

  if(data_obj) {
    self.interface.setQueryString(sb.formatJSON(data_obj));
    return data_obj;    
  } else {
    return false;    
  }
};

// @Description: Start scraping operation
SandBox.prototype.startScraping = function(query_json_obj) {
  var self = this; 
  self.setSchema(query_json_obj);
  self.resetDataTable();
  self.addToLog('Scraping operation started. Interim scraping results will be displayed ' +
  'as they are received by web client. Please Wait...');
  self.socket.emit('start scraping', KSON.stringify(query_json_obj) );  
};

// @Description: checks if the inserted defintion is valid
// @param: sample_string:string
// @param: callback: function(is_valid, error_message)
SandBox.prototype.verifyDefinition = function(sample_string, callback) {
  qv = new QueryValidator();
  qv.validate(sample_string, function(is_valid, error_msg) {
    callback(is_valid, error_msg);
  });  
}


// @Description: stops current scraping operation
SandBox.prototype.stopScraping = function() {
  var self = this;  
  self.addToLog('Stopping scraping operation.');
  self.socket.emit('stop scraping',  self.task_queue_id );
};

// @Description: displays the log output in the <pre>
SandBox.prototype.addToLog = function(data) {
  var self = this;  
  self.interface.incrementCounter('logs');
  self.interface.appendLog(data);
};

// @Description: before test is ran
SandBox.prototype.state1 = function() {
  var self = this;  
  self.interface.taskButton.setStart();
};

// @Description: when test is running
SandBox.prototype.state2 = function() {
  var self = this;  
  self.interface.taskButton.setRunning();
};

// @Description: when test has past
SandBox.prototype.state3 = function() {
  var self = this;    
  self.interface.taskButton.setSuccess();

  // reverts to prevent run state if there are any more edits to the definition
  self.interface.queryString().bind('input cut paste', function() {
    self.interface.queryString().unbind
    self.state1();
  })
};

// @Description: clears up the all the displayed data
SandBox.prototype.clearDisplay = function() {
  var self = this;  
  self.interface.clearData();
};

// @Description: empties the data table and setsup the new table header
SandBox.prototype.resetDataTable = function() { 
  var self = this
  self.interface.clearData();
  self.interface.setHeader(self.current_schema);
};


// @Description: adds a new data row to the data table given a stringified JSON object
// @param: data_string:string
SandBox.prototype.addDataRow = function(data_string) {

  var self = this;  
  self.interface.incrementCounter('data-row');
  var columns = [];
  try {
    data_obj = KSON.parse(data_string);
    self.current_schema.forEach(function(schema) {
      columns.push({ data: data_obj[schema] });
    });
    self.interface.appendRecord(columns);
  } 
  catch(exception) {
    //console.log('Invalid JSON string given. Could not add row');
  }
};

/* 
    @Description : gets the normalized schema entered an JSON object
      @param : query_json_obj:object
        Example :
          {
            origin_url: 'http://www.mdscollections.com/cat_mds_accessories.cfm',
            columns: [
              {
                col_name: 'title',
                dom_query: '.listing_product_name'
              }, {
                col_name: 'price',
                dom_query: '.listing_price'
              }, {
                col_name: 'detailed_page_href',
                dom_query: '.listing_product_name',
                required_attribute: 'href',
                options: {
                  columns: [{
                    col_name: 'description',
                    dom_query: '.tabfield18504'
                  }]          
                }
              }
            ],
            next_page: {
              dom_query: '.listing_next_page'
            }
          };
      @return : schema:array
        Example :  
          [
            'title',
            'price',
            'description'
          ]
 */
SandBox.prototype.setSchema = function(query_json_obj) {
  var self = this;
  self.current_schema = self.getSchemaRecursive(query_json_obj.columns);
  self.current_schema.push('origin_url');
  self.current_schema.push('origin_pattern');
  
  if(query_json_obj.origin_url && query_json_obj.origin_url.origin_value) {
    self.current_schema.unshift('origin_value');
  }

  return self.filterSchema(self.current_schema, query_json_obj);
};

SandBox.prototype.filterSchema = function(schema, object) {
  if(object.column_filter) { 
    schema.filter(function(e){
      return (object.column_filter.indexOf(e) > -1);
    }); 
  } 
  return schema; 
};

/* 
  @Description : returns the column names from the current column object
    If there are recursive options within column, return child column instead
  
  @param : column_array:array
    Example
      [
        {
          col_name: 'title',
          dom_query: '.listing_product_name'
        }, {
          col_name: 'price',
          dom_query: '.listing_price'
        }, {
          col_name: 'detailed_page_href',
          dom_query: '.listing_product_name',
          required_attribute: 'href',
          options: {
            columns: [{
              col_name: 'description',
              dom_query: '.tabfield18504'
            }]          
          }
        }
      ]
            
  @return : schema_array:array
    Example :  
      [
        'title',
        'price',
        'description'
      ]  
*/
SandBox.prototype.getSchemaRecursive = function(column_array) {
  var self = this;
  var schema_array = [];
  var url_values = [];
  
  if(column_array) {
    for(var x = 0; x < column_array.length ; x++ ) {
      curr_column = column_array[x];
      
      if(curr_column.options) { // Has nested column
        url_values.push(curr_column.col_name);
        
        if(curr_column.options.origin_url) {
          console.log('Pushing at line 318 %s', curr_column.col_name);
          url_values.push(curr_column.col_name + '_origin_pattern')
          url_values.push(curr_column.col_name + '_origin_url')          
        }
        
        if(curr_column.options.origin_url && curr_column.options.origin_url.origin_value) {
          schema_array.push(curr_column.col_name + '_origin_value')
        }
        
        schema_array = schema_array.concat(self.getSchemaRecursive(curr_column.options.columns));
      
      } else if(curr_column.required_attribute && curr_column.required_attribute == 'href' || 
        curr_column.required_attribute == 'src' ) { // Is a URL based value
          url_values.push(curr_column.col_name);            
      
      } else { // Has no nested column
        schema_array.push(curr_column.col_name);
                
        //Handles additional fields when the required field is an address
        if(curr_column.required_attribute == 'address') {
          country_key = curr_column.country || curr_column.col_name + '_country' 
          schema_array.push(country_key);
          
          zip_key = curr_column.zipcode || curr_column.col_name + '_zip'          
          schema_array.push(zip_key);
                    
          lat_key = curr_column.latitude || curr_column.col_name + '_lat'
          schema_array.push(lat_key);
                    
          lng_key = curr_column.longitude || curr_column.col_name + '_lng'
          schema_array.push(lng_key);
          
        }
      }
    }
    schema_array = schema_array.concat(url_values);
  }
  return schema_array;
};

// Formats the JSON inserted in the textbox nicely
SandBox.prototype.formatJSON = function(oData, sIndent) {
  var self = this;
  if (arguments.length < 2) {
      var sIndent = "";
  }
  var sIndentStyle = "    ";
  var sDataType = self.realTypeOf(oData);

  // open object
  if (sDataType == "array") {
      if (oData.length == 0) {
          return "[]";
      }
      var sHTML = "[";
  } else {
      var iCount = 0;
      $.each(oData, function() {
          iCount++;
          return;
      });
      if (iCount == 0) { // object is empty
          return "{}";
      }
      var sHTML = "{";
  }

  // loop through items
  var iCount = 0;
  $.each(oData, function(sKey, vValue) {
      if (iCount > 0) {
          sHTML += ",";
      }
      if (sDataType == "array") {
          sHTML += ("\n" + sIndent + sIndentStyle);
      } else {
          sHTML += ("\n" + sIndent + sIndentStyle + "\"" + sKey + "\"" + ": ");
      }

      // display relevant data type
      switch (self.realTypeOf(vValue)) {
          case "array":
          case "object":
              sHTML += self.formatJSON(vValue, (sIndent + sIndentStyle));
              break;
          case "regex": 
              sHTML  += vValue.toString();
              break;
          case "boolean":
          case "number":
              sHTML += vValue.toString();
              break;
          case "null":
              sHTML += "null";
              break;
          case "string":
              sHTML += ("\"" + vValue.replace(/"/g, "'") + "\"");
              break;
          default:
              sHTML += ("TYPEOF: " + typeof(vValue));
      }

      // loop
      iCount++;
  });

  // close object
  if (sDataType == "array") {
      sHTML += ("\n" + sIndent + "]");
  } else {
      sHTML += ("\n" + sIndent + "}");
  }

  // return
  return sHTML;
}


SandBox.prototype.realTypeOf = function(v) {
  if (typeof(v) == "object") {
    if (v === null) return "null";
    if (v.constructor == (new Array).constructor)  return "array";
    if (v.constructor == (new Date).constructor)   return "date";
    if (v.constructor == (new RegExp).constructor) return "regex";
    return "object";
  }
  return typeof(v);
}
