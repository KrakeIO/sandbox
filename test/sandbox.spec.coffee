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

    it "should return data in getColumns", ->
      query = 
        origin_url: "some url"
        columns: [{
          col_name: "col name"
          dom_query: ".css"
        }]
        data:
          val1: "value"
      @sb.setSchema query
      expect(@sb.current_schema.indexOf('val1') > -1 ).toBe true

    it "should return nested data in getColumns", ->
      query = 
        origin_url: "some url"
        columns: [{
          col_name: "col name"
          dom_query: ".css"
          required_attribute: "href"
          options:
            columns: [{
              col_name: "col name2"
              dom_query: ".css2"
            }]
            data:
              val1: "value"
        }]
      @sb.setSchema query
      expect(@sb.current_schema.indexOf('val1') > -1 ).toBe true

    it "should return not have duplicated data col in getColumns", ->
      query = 
        origin_url: "some url"
        columns: [{
          col_name: "col1"
          dom_query: ".css"
        }]
        data:
          col1: "value"
      @sb.setSchema query
      expect(@sb.current_schema.indexOf('col1') > -1 ).toBe true    
      expect(@sb.current_schema.length).toEqual 3    

    it "should return not return duplicated nested data col in getColumns", ->
      query = 
        origin_url: "some url"
        columns: [{
          col_name: "col name"
          dom_query: ".css"
          required_attribute: "href"
          options:
            columns: [{
              col_name: "col2"
              dom_query: ".css2"
            }]
            data:
              col2: "value"
        }]
      @sb.setSchema query
      expect(@sb.current_schema.indexOf('col2') > -1 ).toBe true
      expect(@sb.current_schema.length).toEqual 4

    it "should return not return duplicated nested data col in getColumns", ->
      query = 
        origin_url: "some url"
        columns: [{
          col_name: "col name"
          dom_query: ".css"
          required_attribute: "href"
          options:
            columns: [{
              col_name: "col2"
              dom_query: ".css2"
            }]
            data:
              col2: "value"
        }]
        data:
          col2: "value"

      @sb.setSchema query
      expect(@sb.current_schema.indexOf('col2') > -1 ).toBe true
      expect(@sb.current_schema.length).toEqual 4

    it "should return not return duplicated nested data col in getColumns", ->
      query = 
        origin_url: "some url"
        columns: [{
          col_name: "col name"
          dom_query: ".css"
          required_attribute: "href"
          options:
            columns: [{
              col_name: "col2"
              dom_query: ".css2"
            }]
            data:
              col2: "value"
        },{
          col_name: "col2"
          dom_query: ".css"
        }]
        data:
          col2: "value"
                
      @sb.setSchema query
      expect(@sb.current_schema.indexOf('col2') > -1 ).toBe true
      expect(@sb.current_schema.length).toEqual 4