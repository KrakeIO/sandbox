var sandbox = require('sandbox').sandbox;
var host = 'http://localhost:9901'; // XXX
var self = new sandbox(host);

describe("import", function() {
  it("should export the sandbox function", function() {
    expect(typeof(sandbox)).toBe('function');
  });
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
