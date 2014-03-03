SandBox = require '../lib/sandbox'

describe "SandBox", ->
  beforeEach ->
    SandBox.prototype.setupSocket = ()->
    SandBox.prototype.setDocumentEventListeners = ()->
    @sb = new SandBox "http://localhost:9901", {secure:false}, {}
    
  describe "setSchema", ->
    it "should set schema for self.current_schema", ->
      query = require "./fixtures/json/valid"
      @sb.setSchema query
      expect(@sb.current_schema.length).toEqual 21

    it "should set schema for with permuted_columns", ->
      query = require "./fixtures/json/valid_permuted"
      @sb.setSchema query
      expect(@sb.current_schema.length).toEqual 9

    it "should set schema for with nested permuted_columns", ->
      query = require "./fixtures/json/valid_permuted_nested"
      @sb.setSchema query
      expect(@sb.current_schema.length).toEqual 27

    it "should set schema for with nested permuted_columns", ->
      query = require "./fixtures/json/valid_permuted_nested_3_lvl_1"
      @sb.setSchema query
      expect(@sb.current_schema.length).toEqual 6

    it "should set schema for with nested permuted_columns", ->
      query = require "./fixtures/json/valid_permuted_nested_3_lvl_2"
      @sb.setSchema query
      expect(@sb.current_schema.length).toEqual 7