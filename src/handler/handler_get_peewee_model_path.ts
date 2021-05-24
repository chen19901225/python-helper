import { posix } from "path";
import * as vscode from "vscode";

export function get_peewee_model_path(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let document = textEditor.document;
    let text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount + 1, 0)));
    let currentLine = textEditor.selection.active.line;
    let lines = text.split(/\r?\n/);
    let [model_flag, insert_model] = search_previous_model_line(lines, currentLine);
    // let activeEditor = textEditor.selection.active;
    if (model_flag) {
        textEditor.insertSnippet(new vscode.SnippetString(insert_model), textEditor.selection.active);
        return;
    }
    let [equal_flag, insert_equal] = search_previous_equal_line(lines, currentLine);
    if (equal_flag) {
        textEditor.insertSnippet(new vscode.SnippetString(insert_equal), textEditor.selection.active);
        return;
    }



}



function search_previous_model_line(lines: Array<string>, currentLine: number): [boolean, string] {
    let endList: Array<string> = ["select_with_expression(", "get_or_none(", "_get_or_none("]
    for (let i = currentLine; i >= Math.max(0, currentLine - 100); i--) {
        let text = lines[i];
        for (let endStr of endList) {
            if (text.endsWith(endStr)) {
                let ele = text.slice(0, text.length - endStr.length);
                let stack: Array<string> = []
                for (let j = ele.length - 1; j >= 0; j--) {
                    let j_ch = ele[i];
                    if (j_ch == "." || /[_0-9a-zA-Z]/.test(j_ch)) {
                        stack.unshift(j_ch)
                    }
                }
                let var_str = stack.join("").trim()
                let var_arr = var_str.split(".")
                return [true, var_arr.slice(0, var_arr.length - 1).join(".")]
            }
        }

    }
    return [false, ""]
}

function search_previous_equal_line(lines: Array<string>, currentLine: number): [boolean, string] {
    for (let i = currentLine; i >= Math.max(0, currentLine - 100); i--) {
        let text = lines[i];
        if (text.indexOf("==") > -1) {
            let firstVar = text.split("==")[0].trim();
            let pieces = firstVar.split(".")
            return [true, pieces.slice(0, pieces.length - 1).join(".")];

        }
    }
    return [false, ""]
}