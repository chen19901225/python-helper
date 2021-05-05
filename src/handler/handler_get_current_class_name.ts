import * as vscode from "vscode";
import { update_last_used_variable } from "./handler_last_used_variable";
import { service_position_history_add_position } from "../service/service_position_history";
// import { error } from "util";
// import { get_variable_list } from "../util";

export function get_current_class_name(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let cursor = textEditor.selection.active;
    let line = cursor.line;
    let beginLineNo = Math.max(cursor.line - 1000, 0)
    // let range = new vscode.Range(new vscode.Position(beginLineNo, 0),
    //     new vscode.Position(cursor.line, line.range.end.character))
    for (let i = cursor.line - 1; i >= beginLineNo; i--) {
        let currentLine = textEditor.document.lineAt(i);
        let content = currentLine.text.trim();
        if (content.startsWith("class ")) {
            let class_name = content.slice("class".length, content.indexOf("("));
            class_name = class_name.trim();
            update_last_used_variable(class_name);
            service_position_history_add_position(cursor);
            edit.insert(cursor, class_name);
            break;
        }

    }

}