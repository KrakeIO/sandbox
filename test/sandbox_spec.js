var sandbox = require('sandbox');

describe("sandbox", function() {
  it("should export the sandbox function", function() {
    expect(typeof(sandbox)).toBe('function');
  });
});
