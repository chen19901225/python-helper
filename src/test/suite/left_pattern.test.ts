//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as parser from '../src/parser';
import { setFlagsFromString } from 'v8';
import { left_parttern_split_text_by_underline, left_pattern_convert_list } from '../../handler/handler_get_left_pattern';
import { removeVarType } from '../../util';
// Defines a Mocha test suite to group tests of similar kind together
suite("get left pattern test", () => {

    // Defines a Mocha unit test

    test("test no type", () => {
        let line = "show, me";
        let out = removeVarType(line);
        assert.strictEqual(out, 'show, me')
    })
    test("test one with type with string", () => {
        let line = "name: string";
        let out = removeVarType(line);
        assert.equal(out, "name")
    })

    test("test one type with int", () => {
        let line = "name: int";
        let out = removeVarType(line);
        assert.equal(out, "name")
    })

    test("test one type with dict", () => {
        let line = "name: dict[str, str]";
        let out = removeVarType(line);
        assert.equal(out, "name")
    })

    test("test one type with list", () => {
        let line = "name: List[str]";
        let out = removeVarType(line);
        assert.equal(out, "name")
    })






});


suite("get left pattern split_array_by_underline", () => {
    test("test simple", () => {
        let tables: Array<[string, Array<string>]> = [
            ["name__d", ["name__d", "name", "d"]],
            ["name", ["name"]],

            ["admin__bank_code", ["admin__bank_code", "admin", "bank_code"]],
            ["__user__name", ["__user__name", "user", "name"]],
        ]
        for (let [param, expected] of tables) {
            let out = left_parttern_split_text_by_underline(param);
            assert.deepEqual(out, expected);
        }
    })

    test("convert_list", () => {
        let tables: Array<[string, Array<string>]> = [
            ["this.data['__bank_code__name']", ["this.data['__bank_code__name']", "this.data", "__bank_code__name", "bank_code", "name"]],
            ["data['__bank_code__name']", ["data['__bank_code__name']", "data", "__bank_code__name", "bank_code", "name"]],
            ["name", ["name"]],
            ["this.name", ["this.name", "this", "name"]],
            ["this.name__d", ["this.name__d", "this", "name__d", "name", "d"]],

        ]
        for (let [param, expected] of tables) {
            let out = left_pattern_convert_list(param);
            assert.deepEqual(out, expected)
        }
    })
}); // suite("get left pattern split_array_by_underline")