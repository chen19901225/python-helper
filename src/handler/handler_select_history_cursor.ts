import * as vscode from "vscode";
import * as ts from "typescript";
import { start } from "repl";
import { service_position_history_get_last_position } from "../service/service_position_history";


export function select_history_cusor(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) { 
    let lastPosition = service_position_history_get_last_position();
    let cusor = textEditor.selection.active;
    // let selection = new vscode.Range(lastPosition, cusor);
    textEditor.selection = new vscode.Selection(lastPosition, cusor);

}