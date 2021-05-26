import { posix } from "path";
import * as vscode from "vscode";

export function get_peewee_model_path(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let document = textEditor.document;
    let text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount + 1, 0)));
    let currentLine = textEditor.selection.active.line;
    let lines = text.split(/\r?\n/);
    let result: [number, string] = [-1, ""];
    let [model_flag, model_line_index, model_text] = search_previous_model_line(lines, currentLine);
    // let activeEditor = textEditor.selection.active;
    if (model_flag) {
        if (model_line_index > result[0]) {
            result = [model_line_index, model_text]
        }
        // textEditor.insertSnippet(new vscode.SnippetString(insert_model), textEditor.selection.active);
        // return;
    }
    let [equal_flag, equal_line_index, equal_text] = search_previous_equal_line(lines, currentLine);
    if (equal_flag) {
        if (equal_line_index > result[0]) {
            result = [equal_line_index, equal_text]
        }
        // textEditor.insertSnippet(new vscode.SnippetString(insert_equal), textEditor.selection.active);
        // return;
    }

    let [var_flag, var_line_index, var_text] = search_var_line(lines, currentLine);
    if (var_flag) {
        if(var_line_index > result[0]) {
            result = [var_line_index, var_text]
        }
        // textEditor.insertSnippet(new vscode.SnippetString(insert_var), textEditor.selection.active);
        // return;
    }

    if(result[1].length > 0) {
        textEditor.insertSnippet(new vscode.SnippetString(result[1]), textEditor.selection.active);
    }



}


function search_var_line(lines: Array<string>, currentLine: number): [boolean,number, string] {
    for (let i = currentLine; i >= Math.max(0, currentLine - 100); i--) {
        let text = lines[i];
        let equal_index = text.indexOf("=")
        let comma_index = text.indexOf(":")
        if (equal_index > -1 && comma_index > -1 && comma_index < equal_index) {
            let part = text.trim().split("=")[0].split(":")[1].trim()
            return [true,i, part];
        }
    }
    return [false, -1, ""]
}



function search_previous_model_line(lines: Array<string>, currentLine: number): [boolean, number, string] {
    let endList: Array<string> = [".select_with_expression(", "._get_or_raise(", ".get_or_none("]
    for (let i = currentLine; i >= Math.max(0, currentLine - 100); i--) {
        let text = lines[i];
        for (let endStr of endList) {
            if (text.endsWith(endStr)) {
                let ele = text.slice(0, text.length - endStr.length);
                let stack: Array<string> = []
                for (let j = ele.length - 1; j >= 0; j--) {
                    let j_ch = ele[j];
                    if (j_ch == "." || /[_0-9a-zA-Z]/.test(j_ch)) {
                        stack.unshift(j_ch)
                        continue
                    }
                    break
                }
                let var_str = stack.join("").trim()
                // let var_arr = var_str.split(".")
                return [true, i, var_str]
            }
        }

    }
    return [false, -1, ""]
}

function search_previous_equal_line(lines: Array<string>, currentLine: number): [boolean, number, string] {
    for (let i = currentLine; i >= Math.max(0, currentLine - 100); i--) {
        let text = lines[i];
        if (text.indexOf("==") > -1) {
            let firstVar = text.split("==")[0].trim();
            let pieces = firstVar.split(".")
            return [true, i, pieces.slice(0, pieces.length - 1).join(".")];

        }
    }
    return [false, -1, ""]
}