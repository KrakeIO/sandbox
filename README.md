Introduction
=======

Sandbox is a javascript class that handles interaction between HTML DOM elements on a web page and the 
Krake Socket-Server via Socket.IO

To use the Sandbox, a user must define a corresponding interface for it that hooks up the Sandbox class with the 
HTML DOM elements. 

Example Usage
=======
  
  <!--Include the Sandbox class-->
  <script src='/js/sandbox.js'></script>  
  
  <script>
    // @Description : Start extending Sandbox.interface
    SandBox.interface = {};

    // @Description : Visually increment the counter for a specific type
    // @Param : type:String - the following two String values are called
    //   'logs' -
    /      Called each time a new log gets returned from the Krake Socket Server
    //   'data-row' - 
    //     Called each time a new record gets returned from the Krake Socket Server
    SandBox.interface.incrementCounter = function(type) {
      var selector = '#' + type + '-counter';
      jQuery(selector).html(jQuery(selector).html() * 1 + 1);
    }

    // @Description : This method is called when Sandbox detects an error in the Krake definition.
    // @Param : msg:String - The error message String
    SandBox.interface.displayError = function(msg) {
      jQuery('#krake_err_msg').html(msg);
    }

    // @Description : We are assuming you are using the jQuery Tabs show your results. Types of tabs include the following
    //    edit
    //    logs
    //    datatable
    // @param : id:String - the id to the pane
    SandBox.interface.showPane = function(id) {
      var pane = jQuery('#myTab a[href="#' + id + '_pane"]')
      pane.tab('show');
    }

    // @Description : The method to call when appending new log entries to the logs panel
    // @param : data : String
    SandBox.interface.appendLog = function(data) {
      jQuery('#info_msg').prepend('\n\n');    
      jQuery('#info_msg').prepend(data);
    }

    // @Description : The method to call when appending a new row of record to the datatable panel
    // @param : columns:Array
    //   [{
    //       data : 'column1_value'
    //     },{
    //       data : 'column2_value'
    //   }]
    SandBox.interface.appendRecord = function(columns) {
      var row = document.createElement('tr');
      columns.forEach(function(column) {
        var cell = document.createElement('td');
        var data = column.data;
        if(data) {
          jQuery(column).html(data);
        }
        jQuery(row).append(cell);
      });
      jQuery('#data-table-header').after(row);  
    } 

    // @Description : This method is called by the Sandbox class to get the raw Query String input from the HTML DOM element
    //    that holds the Krake Definition
    SandBox.interface.queryString = function() {
      return jQuery('#krake_content').val();
    }

    // @Description : This method is called by the Sandbox class to set the raw Query String input to the HTML DOM element
    //    that is supposed to hold the Krake Definition
    // @param : f:String
    SandBox.interface.setQueryString = function(f) {
      return jQuery('#krake_content').val(f);
    }

    // @Description : This method is called by the Sandbox class to clear all values in the following panels
    //   krake_err_msg
    //   logs-counter
    //   json-counter 
    //   data_table
    //   data-row-counter
    SandBox.interface.clearData = function() { 
      jQuery('pre').html('');
      jQuery('#krake_err_msg').html('');  
      jQuery('#logs-counter').html(0);
      jQuery('#json-counter').html(0);    
      jQuery('#data_table').html('');
      jQuery('#data-row-counter').html(0);  
    }

    // @Description : This method is called by the Sandbox class to set the table header values for the data_table panel
    // @params : schema:Array[ 'Header 1' ,'Header 2' , 'Header 3' ]
    SandBox.interface.setHeader = function(schema) {
      var row = document.createElement('tr');
      jQuery(row).attr('id', 'data-table-header');
      schema.forEach(function(header) {
        var column = document.createElement('th');
        jQuery(row).append(column);
        jQuery(column).html(header);
      });
      jQuery('#data_table').append(row);
    } 

    // @Description : This method returns the reference to the DOM element [Start Test Button]. 
    //   The [Start Test Button] triggers the sending of task to the Krake Socket 
    //   Service for processing in the cloud
    SandBox.interface.taskButton = function() {
      return jQuery('#run_scrap_button');
    }

    // @Description : This method returns the reference to the [Start Test Button]
    //    when it is in an idle state
    SandBox.interface.taskButton.readsStart = function() {
      var buttonHTML = SandBox.interface.taskButton().html();
      return (/test/i).test(buttonHTML)
    }

    // @Description : This method sets the [Start Test Button] to its idle state
    SandBox.interface.taskButton.setStart = function() {
      jQuery('#run_scrap_button').html('Test it!');
      jQuery('#run_scrap_button').removeAttr("disabled");
    } 

    // @Description : This method sets the [Start Test Button] to its active state
    SandBox.interface.taskButton.setRunning = function() {
      jQuery('#run_scrap_button').html('Pause it!');
    } 

    // @Description : This method sets the [Start Test Button] to its complete state
    SandBox.interface.taskButton.setSuccess = function() {
      jQuery('#run_scrap_button').html('Success!'); 
      jQuery('#run_scrap_button').attr("disabled", "disabled");
    }
  </script>


