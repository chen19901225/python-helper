import * as vscode from "vscode";
import { service_position_history_add_position } from "../service/service_position_history";
// let _last_used_variable: string = null;
let used_variables: Array<string> = [];
let _max_length = 50;


export function get_last_used_variable(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    if (used_variables.length === 0) {
        vscode.window.showErrorMessage("last_used_variable is null");
        return;
    }
    let currentPosition = textEditor.selection.active;
    service_position_history_add_position(currentPosition);
    if (used_variables.length === 1) {
        edit.insert(currentPosition, used_variables[0]);
    }
    let quickItems: vscode.QuickPickItem[] = []
    let leftPad = (ele: string, count: number) => {
        let prefix = '0'.repeat(count);
        let final_ele = prefix + ele
        return final_ele.slice(final_ele.length - count)
    }
    for (let i = used_variables.length - 1; i >= 0; i--) {
        let current_var = used_variables[i];
        quickItems.push({
            'label': leftPad(i.toString(), 2) + "." + current_var,
            'description': current_var
        })
    }

    vscode.window.showQuickPick(quickItems).then((item) => {
        if (item) {
            let current_var = item.description;
            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return;
            }

            activeEditor.insertSnippet(new vscode.SnippetString(current_var), currentPosition)
            if (!current_var) {
                return;
            }
            update_last_used_variable(current_var);
        }
    })



}
export function update_last_used_variable(current_var: string) {
    let index = used_variables.indexOf(current_var);
    if (index > -1) {
        used_variables.splice(index, 1);
    }
    used_variables.push(current_var);
    if (used_variables.length > _max_length) {
        used_variables = used_variables.slice(used_variables.length - _max_length);
    }
    // _last_used_variable = current_var
}