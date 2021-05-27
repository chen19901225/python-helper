import { posix } from "path";
import * as vscode from "vscode";

export function get_peewee_model_path(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let document = textEditor.document;
    let text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount + 1, 0)));
    let currentLine = textEditor.selection.active.line;
    let lines = text.split(/\r?\n/);
    let result: [number, string] = [-1, ""];
    for (let i = currentLine; i >= Math.max(0, i - 100); i++) {
        let text = lines[i];
        let [model_flag, model_text] = search_previous_model_line(text);
        if (model_flag) {
            textEditor.insertSnippet(new vscode.SnippetString(model_text), textEditor.selection.active);
            return;
        }
        let [equal_flag, equal_text] = search_previous_equal_line(text);
        if (equal_flag) {
            textEditor.insertSnippet(new vscode.SnippetString(equal_text), textEditor.selection.active);
            return;
        }

        let [var_flag, var_text] = search_var_line(text);
        if (var_flag) {
            textEditor.insertSnippet(new vscode.SnippetString(var_text), textEditor.selection.active);
            return;
            // return;
        }
    }





}


function search_var_line(text: string): [boolean, string] {
    let equal_index = text.indexOf("=")
    let comma_index = text.indexOf(":")
    if (equal_index > -1 && comma_index > -1 && comma_index < equal_index) {
        let part = text.trim().split("=")[0].split(":")[1].trim()
        if (part.endsWith("]") && part.indexOf("[") > -1) {
            part = part.split("[")[1].split("]")[0].trim();
        }
        return [true, part];
    }
    return [false, ""]
}



function search_previous_model_line(text: string): [boolean, string] {
    let endList: Array<string> = [".select_with_expression(", "._get_or_raise(", ".get_or_none("]
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
            return [true, var_str]
        }
    }


    return [false, ""]
}

function search_previous_equal_line(text: string): [boolean, string] {
    if (text.indexOf("==") > -1) {
        let firstVar = text.split("==")[0].trim();
        let pieces = firstVar.split(".")
        return [true, pieces.slice(0, pieces.length - 1).join(".")];

    }
    return [false, ""]
}