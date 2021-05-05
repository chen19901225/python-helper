//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../extension';
// import * as parser from '../src/parser';
import { setFlagsFromString } from 'v8';
import { generate_insert_string, generate_replace_string } from '../../handler/handler_dict_unpack'
// Defines a Mocha test suite to group tests of similar kind together
suite("unpack Tests alt + i", () => {
    test("test with instance method", () => {
        let line = 'one, two = .get()';
        let out = generate_insert_string(line);
        assert.deepEqual(
            out, [
            '# generated_by_dict_unpack: .get()',
            'one, two = one.get(), two.get()'
        ]
        )
    })
    test("test with call double quote, one var", () => {
        let line = 'one=data.get("';
        let out = generate_insert_string(line);
        assert.deepEqual(
            out, [
            '# generated_by_dict_unpack: data.get("',
            'one = data.get("one")'
        ]
        )
    })
    test("test with call single quote, two var", () => {
        let line = 'one, two=data.get("';
        let out = generate_insert_string(line);
        assert.deepEqual(
            out, [
            '# generated_by_dict_unpack: data.get("',
            'one, two = data.get("one"), data.get("two")'
        ]
        )
    })

    test("test with call single quote, one var", () => {
        let line = "one=data.get('";
        let out = generate_insert_string(line);
        assert.deepEqual(
            out, [
            "# generated_by_dict_unpack: data.get('",
            "one = data.get('one')"
        ]
        )
    })
    test("test with call single quote, two var", () => {
        let line = "one, two=data.get('";
        let out = generate_insert_string(line);
        assert.deepEqual(
            out, [
            "# generated_by_dict_unpack: data.get('",
            "one, two = data.get('one'), data.get('two')"
        ]
        )
    })
    
    test("test with call, two var", () => {
        let line = "one, two=data.get(";
        let out = generate_insert_string(line);
        assert.deepEqual(
            out, [
            "# generated_by_dict_unpack: data.get(",
            "one, two = data.get(one), data.get(two)"
        ]
        )
    })
    test("test with call, one var", () => {
        let line = "one=data.get(";
        let out = generate_insert_string(line);
        assert.deepEqual(
            out, [
            "# generated_by_dict_unpack: data.get(",
            "one = data.get(one)"
        ]
        )
    })

    test("test with left instance 2", () => {
        let line = "self.no_keep_alive=params";
        let out = generate_insert_string(line);
        assert.deepEqual(out, [
            "# generated_by_dict_unpack: params",
            "self.no_keep_alive = params.no_keep_alive"
        ])
    })

    test("test with prefix", () => {
        let line = "image, name=source_";
        let out = generate_insert_string(line);
        assert.deepEqual(out, [
            "# generated_by_dict_unpack: source_",
            "image, name = source_image, source_name",
        ])
    })
    // Defines a Mocha unit test
    test("test source instance", () => {
        let line = "image, name=source";
        let out = generate_insert_string(line);
        assert.deepEqual(out, [
            "# generated_by_dict_unpack: source",
            "image, name = source.image, source.name",
        ])
    });

    test("test source instance2", () => {
        let line = "image, name=this.source";
        let out = generate_insert_string(line);
        assert.deepEqual(out, [
            "# generated_by_dict_unpack: this.source",
            "image, name = this.source.image, this.source.name",
        ])
    });

    test("test source left varaible", () => {
        let line = "self.image, self.name=this.source";
        let out = generate_insert_string(line);
        assert.deepEqual(out, [
            "# generated_by_dict_unpack: this.source",
            "self.image, self.name = this.source.image, this.source.name",
        ])
    })

    test("test left dict", () => {
        let line = "item['name'], item['age']=self.request";
        let out = generate_insert_string(line)
        assert.deepEqual(out, [
            "# generated_by_dict_unpack: self.request",
            "item['name'], item['age'] = self.request[\"name\"], self.request[\"age\"]",
        ])
    })


    test("test source dict", () => {
        let line = "image, name=source_d";
        let out = generate_insert_string(line);
        assert.deepEqual(out, [
            "# generated_by_dict_unpack: source_d",
            'image, name = source_d["image"], source_d["name"]',
        ])
    })

    test("test source dict with indent", () => {
        let line = "image, name=source_d";
        let out = generate_insert_string(line, 2);
        assert.deepEqual(out, [
            "  # generated_by_dict_unpack: source_d",
            '  image, name = source_d["image"], source_d["name"]',
        ])
    })

    test("test source prepend", () => {
        let line = "image, name=source_";
        let out = generate_replace_string(line, "source_");
        assert.equal(out, 'source_image, source_name = source_')
    })


});