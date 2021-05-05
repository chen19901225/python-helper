import * as assert from 'assert';
import { format_dict_line, generate_dict_pair, format_func_line, generate_string_list } from '../../handler/handler_node_format';

suite("node format test", () => {
    test("format_dict_line", () => {
        let table:Array<[string, Array<string>]> = [
            [
                "dict(name=name, age=age)",
                [

                    "#dict(name=name, age=age)",
                    "dict(",
                    "     " + "name=name,",
                    "     " + "age=age",
                    ")"
                ]
            ]
        ]
        for (let i = 0; i < table.length; i++) {
            let [input_str, expected_arr] = table[i];
            let result_arr = format_dict_line(input_str);
            assert.deepEqual(expected_arr, result_arr)
        }

    });

    test("generate_string_list", () => {
        let table:Array<[string, Array<string>]> = [
            [
                "a, b",
                [

                    '["{a}", "{b}"]'
                ]
            ],
           
        ]
        for (let i = 0; i < table.length; i++) {
            let [input_str, expected_arr] = table[i];
            let result_arr = generate_string_list(input_str);
            assert.deepEqual(expected_arr, result_arr)
        }
    })

    test("generate_dict", () => {

        let table:Array<[string, Array<string>]> = [
            [
                "a, b",
                [

                    "#a, b",
                    "a = a, b = b"
                ]
            ],
            [
                "a, b)",
                [
                    "#a, b)",
                    "a = a, b = b)",
                    
                ]
            ]
        ]
        for (let i = 0; i < table.length; i++) {
            let [input_str, expected_arr] = table[i];
            let result_arr = generate_dict_pair(input_str);
            assert.deepEqual(expected_arr, result_arr)
        }
    })

    test("def ", () => {

        let table:Array<[string, Array<string>]> = [
            [
                "def(a, b",
                [

                    "#def(a, b",
                    "def(",
                    "    a,",
                    "    b"
                ]
            ],
            [
                "def(a, b)",
                [
                    "#def(a, b)",
                    "def(",
                    "    a,",
                    "    b",
                    ")"
                    
                ]
            ],
            [
                "def(a, b,",
                [
                    "#def(a, b,",
                    "def(",
                    "    a,",
                    "    b,",
                    
                ]
            ],

        ]

        table.forEach((value) => {
            let [input_str, expected_arr] = value;

            let result_arr = format_func_line(input_str);
            assert.deepEqual(result_arr, expected_arr)
        })
    });
});