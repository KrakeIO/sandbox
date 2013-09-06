window = require('jsdom').jsdom().createWindow();
jQuery = $ = require('jquery');

var sandbox = require('sandbox').sandbox;
var host = 'http://localhost:9901'; // XXX
var self = new sandbox(host);

describe("import", function() {
  it("should export the sandbox function", function() {
    expect(typeof(sandbox)).toBe('function');
  });
});

describe("setupSocket", function() {
  beforeEach(function(){
    spyOn(io, 'connect').andCallThrough();
    spyOn(self, 'setSocketEventListeners'); 
    self.setupSocket(host);
  })
  it("should define a socket interface", function() {
    expect(io.connect).toHaveBeenCalled();
  })
  it("should set up listeners for socket events", function() {
    expect(self.setSocketEventListeners).toHaveBeenCalled();
  })
})

describe("setSocketEventListeners", function() {
//  it("should append to the log when 'connected' is emitted", function() {
//    spyOn(self,'addToLog');
//    self.socket.emit('connected', {status: 'success'});
//    expect(self.addToLog).toHaveBeenCalled();
//  })
})

describe("setDocumentEventListeners", function() {
  it("should be set to state1", function() {
    spyOn(self, 'state1');
    self.setDocumentEventListeners();
    expect(self.state1).toHaveBeenCalled();
  });
})

describe("setDocumentEventListeners::taskButton.click", function(){
  beforeEach(function(){
    validDefinition = 
      { "origin_url": "http://www.springer.com/new+%26+forthcoming+titles+%28default%29?SGWID=5-40356-404-173621539-666"
      , "columns": 
          [ { "col_name": "title"
            , "xpath": "//li[@class='listItemBooks']/div[2]/div[1]/h2/a"
            }
          , { "col_name": "year"
            , "xpath": "//li[@class='listItemBooks']/div[2]/div[1]/p/span[@class='displayblock']"
            }
          ]
      , "next_page": 
          { "xpath": "//*[@class='arrow arrowRight' and @href !='#']"
          }
      }
    invalidDefinition = {}
  })
  it("should set up a socket if one isn't", function(){
    self.socket = undefined;
    self.setDocumentEventListeners();
    spyOn(self,'setupSocket').andCallThrough();
    self.interface.taskButton().click();
    expect(self.setupSocket).toHaveBeenCalled();
  });
  it("should test if the task button reads start", function() {
    spyOn(self.interface.taskButton, 'readsStart')
    self.interface.taskButton().trigger('click');
    expect(self.interface.taskButton.readsStart).toHaveBeenCalled();
  })
  it("should test if the definition is valid when the start button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(true);
    spyOn(self, 'getJsonQueryObject').andReturn({});
    spyOn(self,'verifyDefinition');
    self.interface.taskButton().trigger('click');
    expect(self.verifyDefinition).toHaveBeenCalled();
  });
  it("should start scraping when the definition is valid and the start button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(true);
    spyOn(self, 'getJsonQueryObject').andReturn(validDefinition);
    spyOn(self, 'startScraping');
    self.interface.taskButton().trigger('click');
    expect(self.startScraping).toHaveBeenCalled();
  })
  it("should be set to state2 when the definition is valid and the start button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(true);
    spyOn(self, 'getJsonQueryObject').andReturn(validDefinition);
    spyOn(self, 'state2');
    self.interface.taskButton().trigger('click');
    expect(self.state2).toHaveBeenCalled();
  })
  it("should display an error when the definition is invalid and the start button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(true);
    spyOn(self, 'getJsonQueryObject').andReturn(invalidDefinition);
    spyOn(self.interface, 'displayError');
    self.interface.taskButton().trigger('click');
    expect(self.interface.displayError).toHaveBeenCalled();
  })
  it("should show the edit pane when the definition is invalid and the start button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(true);
    spyOn(self, 'getJsonQueryObject').andReturn(invalidDefinition);
    spyOn(self.interface, 'showPane');
    self.interface.taskButton().trigger('click');
    expect(self.interface.showPane).toHaveBeenCalledWith('edit');
  })
  it("should be set to state1 when the definition is invalid and the start button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(true);
    spyOn(self, 'getJsonQueryObject').andReturn(invalidDefinition);
    spyOn(self, 'state1');
    self.interface.taskButton().trigger('click');
    expect(self.state1).toHaveBeenCalled();
  })
  it("should show the edit pane when the stop button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(false);
    spyOn(self.interface, 'showPane');
    self.interface.taskButton().trigger('click');
    expect(self.interface.showPane).toHaveBeenCalledWith('edit');
  })
  it("should stop scraping when the stop button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(false);
    spyOn(self, 'stopScraping');
    self.interface.taskButton().trigger('click');
    expect(self.stopScraping).toHaveBeenCalled()
  })
  it("should be set to state1 when the stop button is clicked", function() {
    spyOn(self.interface.taskButton, 'readsStart').andReturn(false);
    spyOn(self, 'state1');
    self.interface.taskButton().trigger('click');
    expect(self.state1).toHaveBeenCalled()
  })
});

describe("getJsonQueryObject", function() {
  beforeEach(function(){
    badQueryString  = '\
      <definition>\
        <columns>\
          <column name="title">\
            <xpath>"//body/article/h1[@class=\'post-title\']"</xpath>\
          </column>\
        </columns>\
      </definition>\
    '
    goodJSONQuery =
      { "columns":
          [{ "column_name": "title"
           , "xpath": "//body/article/h1[@class='post-title']"
           }
          ]
      }
    goodJSONQueryString = JSON.stringify(goodJSONQuery);
    goodJSQueryString = '\
      { columns:\
          [{ column_name: "title"\
           , xpath: "//body/article/h1[@class=\'post-title\']"\
           }\
          ]\
      }'
    eval ('goodJSQuery = ' + goodJSQueryString);
  })
  it("should retrieve the value of the interface's query holder", function(){
    spyOn(jQuery.prototype, 'val');
    self.getJsonQueryObject()
    expect(jQuery.prototype.val).toHaveBeenCalled();
  })
  it("should return the object corresponding to string representation of a some argument json.", function(){
    spyOn(jQuery.prototype, 'val').andReturn(goodJSONQueryString);
    expect(self.getJsonQueryObject()).toEqual(goodJSONQuery);
  })
  it("should return the object corresponding to string representation of a some argument js.", function(){
    spyOn(jQuery.prototype, 'val').andReturn(goodJSQueryString);
    expect(self.getJsonQueryObject()).toEqual(goodJSQuery);
  })
  it("should return the false if the parsing of the text fails", function(){
    spyOn(jQuery.prototype, 'val').andReturn(badQueryString);
    expect(self.getJsonQueryObject()).toEqual(false);
  })
})

describe("startScraping", function() {
  it("should assign the schema associated with the arg to self", function(){
    spyOn(self, 'setSchema');
    self.startScraping({});
    expect(self.setSchema).toHaveBeenCalled();
  })
  it("should reset the data table on the page", function(){
    spyOn(self, 'resetDataTable');
    self.startScraping({});
    expect(self.resetDataTable).toHaveBeenCalled();
  })
  it("should append a message to the log", function() {
    spyOn(self, 'addToLog');
    self.startScraping({});
    expect(self.addToLog).toHaveBeenCalled();
  })
  it("should ask the socket to start scraping, and pass it the object", function(){
    spyOn(self.socket, 'emit');
    self.startScraping({});
    expect(self.socket.emit).toHaveBeenCalledWith('start scraping', '{}')
  })
})

describe("verifyDefinition", function() {
  it("should call the validator class with its argument", function() {
    spyOn(QueryValidator.prototype, 'validate')
    self.verifyDefinition("", function(){});
    expect(QueryValidator.prototype.validate).toHaveBeenCalled;
  });
})

describe("stopScraping", function() {
  it("should append a message to the log", function() {
    spyOn(self, 'addToLog');
    self.stopScraping({});
    expect(self.addToLog).toHaveBeenCalled();
  })
  it("should ask the socket to stop scraping", function(){
    spyOn(self.socket, 'emit');
    self.stopScraping({});
    expect(self.socket.emit).toHaveBeenCalledWith('stop scraping', self.task_queue_id)
  })
})

describe("addToLog", function() {
  it("should increment the interface's log counter", function() {
    spyOn(self.interface, 'incrementCounter');
    self.addToLog("Shit's going down.");
    expect(self.interface.incrementCounter).toHaveBeenCalled();
  })
  it("should append its argument to the interface's log output", function() {
    spyOn(self.interface, 'appendLog');
    self.addToLog("Shit's going down.");
    expect(self.interface.appendLog).toHaveBeenCalledWith("Shit's going down.");
  })
});

describe("state1", function() {
  it("should set the taskbutton to start", function(){
    spyOn(self.interface.taskButton, 'setStart');
    self.state1();
    expect(self.interface.taskButton.setStart).toHaveBeenCalled();
  })
});

describe("state2", function() {
  it("should set the taskbutton to running", function(){
    spyOn(self.interface.taskButton, 'setRunning');
    self.state2();
    expect(self.interface.taskButton.setRunning).toHaveBeenCalled();
  })
});

describe("state3", function() {
  it("should set the taskbutton to success", function(){
    spyOn(self.interface.taskButton, 'setSuccess');
    self.state3();
    expect(self.interface.taskButton.setSuccess).toHaveBeenCalled();
  })
  it("should bind an event to trigger when there are further edits to the definition", function(){
    spyOn(jQuery.prototype, 'bind');
    self.state3();
    expect(jQuery.prototype.bind).toHaveBeenCalled();
  })
  it("should transition to state1 when there are further edits to the definition", function(){
    self.state3();
    spyOn(self, 'state1');
    self.interface.queryHolder().trigger('input')
  })
});


describe("clearDisplay", function() {
  it("should clear the contents of the data table", function() {
    spyOn(self.interface,'clearData');
    self.clearDisplay();
    expect(self.interface.clearData).toHaveBeenCalled();
  });
})

describe("resetDataTable", function() {
  it("should clear the contents of the data table", function() {
    spyOn(self.interface,'clearData');
    self.resetDataTable();
    expect(self.interface.clearData).toHaveBeenCalled();
  });
  it("should reset the header of the data table", function() {
    spyOn(self.interface,'setHeader');
    self.resetDataTable();
    expect(self.interface.setHeader).toHaveBeenCalled();
  });
})

describe("addDataRow", function(){
  it("should increment the row counter", function(){
    spyOn(self.interface, 'incrementCounter');
    self.addDataRow("")
    expect(self.interface.incrementCounter).toHaveBeenCalledWith('data-row');
  })
  it("should not attempt to append ill-formed results")
  it("should append values who's keys are in the schema")
  it("should not append values who's keys are not in the schema")
})

describe("setSchema", function() {
  beforeEach(function(){
    self.current_schema = [];
  });
  it("Should extract columns by calling `getSchemaRecursive`", function(){
    var task = { columns: [] }
    spyOn(self,'getSchemaRecursive').andCallThrough();
    self.setSchema(task);
    expect(self.getSchemaRecursive).toHaveBeenCalled();
  });
  it("Should include 'origin_url'", function(){
    var task = { columns: [] }
    self.setSchema(task);
    expect(self.current_schema).toContain('origin_url');
  });
  it("Should include 'origin_pattern'", function(){
    var task = { columns: [] }
    self.setSchema(task);
    // Despite being absent in our definition.
    expect(self.current_schema).toContain('origin_pattern');
  });
  it("Should include 'origin_value' if 'origin_url' is an object describing them", function(){
    var task = {
      origin_url:
        { origin_pattern: ""
        , origin_value: []
        }
    }
    self.setSchema(task);
    expect(self.current_schema).toContain('origin_value');
  });
  it("Should not include 'origin_value' if 'origin_url' is not an object describing them", function(){
    var task = { origin_url:  "http://html5zombo.com/" }
    self.setSchema(task);
    expect(self.current_schema).not.toContain('origin_value');
  });
  it("Should pass process the list through `filterSchema` before returning it", function(){
    var task = { columns: [] }
    spyOn(self,'filterSchema');
    self.setSchema(task);
    expect(self.filterSchema).toHaveBeenCalled();
  });
});

describe("filterSchema", function() {
  var achievements = ["warrior_id","crushed_enemies","seen_driven","heard_lamentation"];
  it("should preserve the schema if a `column_filter` is not described", function(){
    var object = {};
    var filtered = self.filterSchema(achievements, object);
    expect(filtered).toEqual(achievements);
  });
  it("should subtract schema values not members of `column_filter`", function(){
    var object = { column_filter: ["warrior_id","heard_lamentation"] };
    var filtered = self.filterSchema(achievements, object);
    expect(filtered).toEqual(["warrior_id","heard_lamentation"]);
  });
  it("should preserve schema values described in `column_filter`", function(){
    var object = { column_filter: ["warrior_id"] };
    var filtered = self.filterSchema(achievements, object);
    expect(filtered).toEqual(["warrior_id"]);
  });
});

describe("getSchemaRecursive", function() {
  beforeEach(function(){
    columns = []
  })
  it("should return an empty schema if it does not receive a columns object", function() {
    var schema = self.getSchemaRecursive();
    expect(schema).toEqual([]);
  })
  it("should retrieve top-level columns described in the received object", function(){
    columns = columns.concat([
      { col_name: 'name' }, 
      { col_name: 'station' },
    ])
    var schema = self.getSchemaRecursive(columns);
    ['name','station'].forEach(function(column){
      expect(schema).toContain(column)
    })
  })
  it("should retrieve nested columns described in the received object", function(){
    var column = 
      { options: 
          { columns: 
              [ { col_name: 'inception' } ]
          }
      }
    columns.push(column);
    var schema = self.getSchemaRecursive(columns);
    expect(schema).toContain('inception');
  })
  it("should include nested origin attributes in schema array", function(){ 
    var column = 
      { col_name: 'privilege'
      , options: 
          { origin_url: 
              { origin_value: {}
              }
          }
      }
    columns.push(column);
    var schema = self.getSchemaRecursive(columns);
    ['privilege_origin_pattern', 'privilege_origin_url', 'privilege_origin_value'].forEach(function(col){
      expect(schema).toContain(col);
    })
  })
  it("should append geolocation fields to the schema if an address is required", function(){
    var column = 
      { col_name: 'location'
      , required_attribute: 'address'
      }
    columns.push(column);
    var schema = self.getSchemaRecursive(columns);
    ["location_country", "location_zip", "location_lat", "location_lng"].forEach(function(name){
      expect(schema).toContain(name);
    });
  })
 it("should name geolocation fields as described by user when provided", function(){
    var column = 
      { required_attribute: 'address'
      , country: 'elbonia'
      , zipcode: '00'
      , latitude: '53'
      , longitude: '28'
      }
    columns.push(column);
    var schema = self.getSchemaRecursive(columns);
    for (property in column) { 
      if (property != 'required_attribute') 
        expect(schema).toContain(column[property]);
    }
 })
});

describe("formatJSON", function() {
  it("Should describe an empty object on one line", function() {
    var json = self.formatJSON({})
    expect(json).toBe("{}");
  });
  it("Should describe an empty list on one line", function(){
    var json = self.formatJSON([])
    expect(json).toBe("[]");
  })
  it("should join multiple elements with commas", function() {
    var json = self.formatJSON([1,2])  
    expect(json.match(/,/)).not.toBe(null)
  })
  it("it should prefix list/object members with four spaces on their own line", function() {
    var json = self.formatJSON([1,2])  
    expect(json.match(/\n {4}/)).not.toBe(null);
  })
  it("should wrap the key of object members in quotes, and separate the key and value ': '", function() {
    var json=self.formatJSON({
      boring: 'jasmine'
    })
    expect(json.match(/"boring": /)).not.toBe(null);
  })
  it("should quote value strings appropriately", function() {
    var json=self.formatJSON({
      boring: 'jasmine',
      kool:   '\"sencha\"'
    })
    expect(json.match(/"jasmine"/)).not.toBe(null);
    expect(json.match(/"\\"sencha\\""/)).not.toBe(null);
  });
  it("should represent non-kson supported types as strings in the format 'TYPEOF: $type$'", function() {
    var json = self.formatJSON([function(){}])
    expect(json.match(/TYPEOF: function/)).not.toBe(null);
  })
});

describe("realTypeOf", function() {
  it("Should correctly classify string values.", function() {
    var value = "Wake up, Neo...";
    var realType = self.realTypeOf(value);
    expect(realType).toBe('string');
  });
  it("Should correctly classify boolean values.", function() {
    var value = true || false;
    var realType = self.realTypeOf(value);
    expect(realType).toBe('boolean');
  });
  it("Should correctly classify number values.", function() {
    var value = Math.pow(10,3) + Math.pow(9,3);
    var realType = self.realTypeOf(value);
    expect(realType).toBe('number');
  });
  it("Should correctly classify undefined values.", function() {
    var value = undefined;
    var realType = self.realTypeOf(value);
    expect(realType).toBe('undefined');
  });
  it("Should correctly classify function values.", function() {
    var value = function(){ value(); };
    var realType = self.realTypeOf(value);
    expect(realType).toBe('function');
  });
  it("Should correctly classify null values.", function() {
    var value = null;
    var realType = self.realTypeOf(value);
    expect(realType).toBe('null');
  });
  it("Should correctly classify regex objects.", function() {
    var value = /I know [ \w]+!/i;
    var realType = self.realTypeOf(value);
    expect(realType).toBe('regex');
  });
  it("Should correctly classify date objects.", function() {
    var value = new Date('1752-09-03');
    var realType = self.realTypeOf(value);
    expect(realType).toBe('date');
  });
  it("Should correctly classify array objects.", function() {
    var value = [0,1,1,2,3,5,8,12];
    var realType = self.realTypeOf(value);
    expect(realType).toBe('array');
  });
});
