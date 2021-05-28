import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { search_previous_equal_line, search_previous_model_line, search_var_line } from '../../handler/handler_get_peewee_model_path';
// import * as myExtension from '../../extension';

suite('get peewee model test', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('equal test', () => {
        let table: Array<[string, string]> = [
            ["app.models.MUser.local_id==test", "app.models.MUser"]
        ]
        for (let [source, expected] of table) {
            let [flag, result] = search_previous_equal_line(source)
            assert.strictEqual(flag, true);
            assert.strictEqual(expected, result)
        }

    });

    test('model test', () => {
        let table: Array<[string, string]> = [
            ["app.models.MUser.select_with_expression([", "app.models.MUser"],
            ["app.models.MUser.select_with_expression(", "app.models.MUser"],
            ["app.models.MUser.get_or_none(", "app.models.MUser"],
            ["record_ader: app.models.MAder = app.models.MAder._get_or_raise([", "app.models.MAder"],
            ["app.models.MUser._get_or_raise([", "app.models.MUser"],
            ["app.models.MUser._get_or_raise(", "app.models.MUser"],
        ]
        for (let [source, expected] of table) {
            let [flag, result] = search_previous_model_line(source)
            assert.strictEqual(flag, true, `fail to for str [${source}]`);
            assert.strictEqual(expected, result)
        }

    });

    test('var test', () => {
        let table: Array<[string, string]> = [
            ["user:app.models.MUser = ", "app.models.MUser"],
            ["record_ader: app.models.MAder = app.models.MAder._get_or_raise([", "app.models.MUser"],
        ]
        for (let [source, expected] of table) {
            let [flag, result] = search_var_line(source)
            assert.strictEqual(flag, true);
            assert.strictEqual(expected, result)
        }

    });

});
