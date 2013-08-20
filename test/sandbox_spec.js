var sandbox = require('sandbox').sandbox;
var host = 'http://localhost:9901'; // XXX
var self = new sandbox(host);

describe("import", function() {
  it("should export the sandbox function", function() {
    expect(typeof(sandbox)).toBe('function');
  });
});

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
  it("should subtract schema values that are also members of `column_filter`", function(){
    var object = { column_filter: ["warrior_id","heard_lamentation"] };
    var filtered = self.filterSchema(achievements, object);
    expect(filtered).toEqual(["warrior_id","heard_lamentation"]);
  });
  it("should preserve schema values not described in `column_filter`", function(){
    var object = { column_filter: ["warrior_id"] };
    var filtered = self.filterSchema(achievements, object);
    expect(filtered).toEqual(["warrior_id"]);
  });
});

describe("getSchemaRecursive", function() {
  var columns = 
    [ { col_name: 'title' }
    , { col_name: 'price' }
    , { col_name: 'href' 
      , options: { 
          columns: [ { col_name: 'description' } ]          
        }
      }
    ]
  var filtered = self.getSchemaRecursive(columns);
  it("should describe bottom-level columns", function() {
    ["title", "price", "description"].forEach(function(bottom){
      expect(filtered).toContain(bottom);
    });
  })
  it("should not describe columns that have children", function() {
    expect(filtered).not.toContain("detailed_page_href")
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
