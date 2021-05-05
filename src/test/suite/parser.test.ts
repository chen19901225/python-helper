//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as parser from '../../parser';
import { setFlagsFromString } from 'v8';

// Defines a Mocha test suite to group tests of similar kind together
suite("parser Tests", () => {

    test("test with comment1 with kwargs", () => { // 注释
        let definition = `def create_machine(
            cls, # cls
            # cls
            name, # name
            account_type, # account_type
            account, # account
            url="", # url
            secret="",
            status=0,
            is_online=0,
            is_locked=0,
            create_at=None,
            user_id=0,  # 默认是平台
            real_nick="",  # 转卡的真实姓名
            bank_name="",  # 转卡的银行名字
            open_bank_address="",
            validate=True
         ):`
        let param_lines = parser.parse_parse_params(definition);
        //let kwargs_list = parser.parse_parse_params(param_lines);
        assert.deepEqual(param_lines, [
            'cls',
            'name',
            'account_type',
            'account',
            'url=""',
            'secret=""',
            'status=0',
            'is_online=0',
            'is_locked=0',
            'create_at=None',
            'user_id=0',
            'real_nick=""',
            'bank_name=""',
            'open_bank_address=""',
            'validate=True'
        ]);
    });
    test("test with no args", () => {
        let definition = `def hello_world():`;
        let func_name = parser.parse_function_name(definition);
        assert.equal(func_name, "hello_world")

        let param_lines = parser.parse_parse_params(definition);
        assert.deepEqual(param_lines, [

        ])
        let arg_list = parser.parse_args(param_lines);
        assert.deepEqual(arg_list, [

        ])
        let kwargs_list = parser.parse_kwargs(param_lines);
        assert.deepEqual(kwargs_list, []);

    })
    test("test with async ", () => {
        let definition = `async def hello_world():`;
        let func_name = parser.parse_function_name(definition);
        assert.equal(func_name, "hello_world")

        let param_lines = parser.parse_parse_params(definition);
        assert.deepEqual(param_lines, [

        ])
        let arg_list = parser.parse_args(param_lines);
        assert.deepEqual(arg_list, [

        ])
        let kwargs_list = parser.parse_kwargs(param_lines);
        assert.deepEqual(kwargs_list, []);

    });
    test("test hello_world_func with imported return type", () => {
        let definition = `def hello_world_func(no_type, name: str,
            kw_no_type,
            kw_no_type_and_default=10,
            name2:str = "hello") -> typing.List[str, str]:`;

        let function_name = parser.parse_function_name(definition);
        assert.equal(function_name, "hello_world_func");
        let param_lines = parser.parse_parse_params(definition);
        assert.deepEqual(param_lines, [
            "no_type",
            "name: str",
            "kw_no_type",
            "kw_no_type_and_default=10",
            'name2:str = "hello"'
        ])
        let arg_list = parser.parse_args(param_lines);
        assert.deepEqual(arg_list, [
            "no_type",
            "name",
            "kw_no_type"
        ])
        let kwargs_list = parser.parse_kwargs(param_lines);
        assert.deepEqual(kwargs_list, ['kw_no_type_and_default', 'name2']);
        assert.equal(parser.parse_star_args(param_lines), '');
        assert.equal(parser.parse_star_kwargs(param_lines), '');
    })
    // Defines a Mocha unit test
    test("test hello_world_func", () => {
        let definition = `def hello_world_func(no_type, name: str,
            kw_no_type,
            kw_no_type_and_default=10,
            name2:str = "hello") -> List[str, str]:`;

        let function_name = parser.parse_function_name(definition);
        assert.equal(function_name, "hello_world_func");
        let param_lines = parser.parse_parse_params(definition);
        assert.deepEqual(param_lines, [
            "no_type",
            "name: str",
            "kw_no_type",
            "kw_no_type_and_default=10",
            'name2:str = "hello"'
        ])
        let arg_list = parser.parse_args(param_lines);
        assert.deepEqual(arg_list, [
            "no_type",
            "name",
            "kw_no_type"
        ])
        let kwargs_list = parser.parse_kwargs(param_lines);
        assert.deepEqual(kwargs_list, ['kw_no_type_and_default', 'name2']);
        assert.equal(parser.parse_star_args(param_lines), '');
        assert.equal(parser.parse_star_kwargs(param_lines), '');
    });
    
    test("test hello_world_func_with_star_kwargs", () => {
        let definition = `def hello_world_func(no_type, name: str,
            kw_no_type,
            kw_no_type_and_default=10,
            name2:str = "hello", **kwargs) -> List[str, str]:`;

        let function_name = parser.parse_function_name(definition);
        assert.equal(function_name, "hello_world_func");
        let param_lines = parser.parse_parse_params(definition);
        assert.deepEqual(param_lines, [
            "no_type",
            "name: str",
            "kw_no_type",
            "kw_no_type_and_default=10",
            'name2:str = "hello"',
            '**kwargs'
        ])
        let arg_list = parser.parse_args(param_lines);
        assert.deepEqual(arg_list, [
            "no_type",
            "name",
            "kw_no_type"
        ])
        let kwargs_list = parser.parse_kwargs(param_lines);
        assert.deepEqual(kwargs_list, ['kw_no_type_and_default', 'name2']);
        assert.equal(parser.parse_star_args(param_lines), '');
        assert.equal(parser.parse_star_kwargs(param_lines), 'kwargs');
    });
    test("test one with return type", () => {
        let definition = "def db_re_stop_app(self) -> DWReStopApp:";
        let function_name = parser.parse_function_name(definition);
        assert.equal(function_name, "db_re_stop_app");
    })
    test("test test_star_args", () => {
        let definition = `def test_star_args(self, *args, **kwargs):`;

        let function_name = parser.parse_function_name(definition);
        assert.equal(function_name, "test_star_args");
        let param_lines = parser.parse_parse_params(definition);
        assert.deepEqual(param_lines, [
            'self',
            "*args",
            "**kwargs",
        ])
        let arg_list = parser.parse_args(param_lines);
        assert.deepEqual(arg_list, ['self'
        ])
        let kwargs_list = parser.parse_kwargs(param_lines);
        assert.deepEqual(kwargs_list, []);
        assert.equal(parser.parse_star_args(param_lines), 'args');
        assert.equal(parser.parse_star_kwargs(param_lines), 'kwargs');
    });
});