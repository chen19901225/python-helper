import { posix } from "path";
import * as vscode from "vscode";
import { getConfig } from "../config";

// let query_start = "# cqh_query?"


export function get_query_tag(): string {
    return "# " + getConfig().query_name + "?"
}


export function get_var_from_query_runner(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let document = textEditor.document;
    let text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount + 1, 0)));
    let currentLine = textEditor.selection.active.line;
    let [flag, comment_line, document_line] = search_previous_query_lines(text, currentLine);
    if (flag) {
        // textEditor.in
        // if()
        if (document_line.length > 0 && document_line[0].trim().length > 0) {
            handle_with_query(comment_line, document_line, textEditor.selection.active, textEditor);
        }

    }

}

function handle_with_query(comment_line: string, document_line: Array<string>, position: vscode.Position, activeEditor: vscode.TextEditor) {
    let line_text = document_line[0];
    line_text = line_text.trim();
    let name_value_pairs: Array<string> = line_text.split("&")
    let name_array: Array<string> = []
    for (let name_value of name_value_pairs) {
        if (name_value.indexOf("=") == -1) {
            name_array.push(name_value)
        } else {
            name_array.push(name_value.split("=")[0])
        }
    }
    let insert_text = name_array.join(", ");

    activeEditor.insertSnippet(new vscode.SnippetString(insert_text), position);

}

function search_previous_query_lines(text: string, currentLineNo: number): [boolean, string, Array<string>] {

    let lines = text.split(/\r?\n/);
    let comment_line: string = "";
    let document_line_list: Array<string> = []
    let is_match = false;
    for (let i = currentLineNo; i >= Math.max(0, currentLineNo - 100); i--) {
        let walk_line_text = lines[i].trim();
        if (walk_line_text.startsWith(get_query_tag())) {
            let previous_line_match = ["'''", '"""']
            let previous_line_text = lines[i - 1].trim();
            if (previous_line_match.indexOf(previous_line_text) > -1) { // 上一行结果是对的
                // 只读下面的一行
                is_match = true;
                document_line_list.push(lines[i + 1])
                break
            }
        }

    }

    return [is_match, comment_line, document_line_list]

}