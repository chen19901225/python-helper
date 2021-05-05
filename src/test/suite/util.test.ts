
// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as parser from '../src/parser';
import { setFlagsFromString } from 'v8';
import { get_variable_list, extraVariablePart } from "../../util"
// Defines a Mocha test suite to group tests of similar kind together
suite("获取var 列表，从当前行", () => {

    // Defines a Mocha unit test
    test("single assign", () => {
        let line = "name='test'";
        let vars = get_variable_list(line);
        assert.deepEqual(vars, ["name", "'test'"])
    });

    test("multi assign", () => {
        let line = "name,status='test',200";
        let vars = get_variable_list(line);
        assert.deepEqual(vars, ["name", "status", "'test'", 200])
    })

    test("parent", () => {
        let line = "name,status=(1, 2)";
        let vars = get_variable_list(line);
        assert.deepEqual(vars, ["name", "status", "(1, 2)"])
    })




});


suite("从方法调用里面获取变量", () => {

    // Defines a Mocha unit test
    test("single assign", () => {
        let line = "name";
        let vars = extraVariablePart(line);
        assert.deepEqual(vars, "name");
    });

    test("multi assign", () => {
        let line = "this.name";
        let vars = extraVariablePart(line);
        assert.deepEqual(vars, "this.name");
    })

    test("with method", () => {
        let line = "this.stream.closed()";
        let vars = extraVariablePart(line);
        assert.deepEqual(vars, "this.stream");
    })




});