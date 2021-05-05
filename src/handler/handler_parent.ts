import * as vscode from "vscode";
import { parse_function, FunctionDef } from '../parser';
import { service_position_history_add_position } from "../service/service_position_history";
import { try_get_definition } from '../util'
import { update_last_used_variable } from "./handler_last_used_variable";

export function get_parent_args(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const definition = try_get_definition(textEditor, edit);
    if (definition == null) {
        throw Error("definition is null");
    }
    const parseResult = parse_function(definition);
    const elements: Array<string> = [];

    // let elements: Array<string> = [];
    for (let arg of parseResult.args) {
        if (['self', 'cls'].indexOf(arg) > -1) {
            elements.push(`${arg}`);
            continue;
        }
        elements.push(`${arg}=${arg}`);
    }
    for (let kwarg of parseResult.kwargs) {
        elements.push(`${kwarg}=${kwarg}`);
    }
    if (parseResult.star_args !== '') {
        elements.push(`*${parseResult.star_args}`)
    }
    if (parseResult.star_kwargs !== '') {
        elements.push(`**${parseResult.star_kwargs}`)
    }
    let quickPickItem: vscode.QuickPickItem[] = [];
    let i = 0;
    for (; i < Math.min(elements.length, 10); i++) {
        quickPickItem.push({
            label: `${i}.${elements[i]}`,
            description: `${i}`
        })
    }
    let getInsertedContent = (index: string) => {
        return elements.slice(Number.parseInt(index)).join(", ")
    }
    let currentPosition = textEditor.selection.active;
    vscode.window.showQuickPick(quickPickItem).then((item) => {
        if (item) {
            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return;
            }
            let insertedText = getInsertedContent(item.description!);
            activeEditor.insertSnippet(new vscode.SnippetString(insertedText), currentPosition)
        }
    })

    // const insertContent = elements.join(", ");
    // let currentPosition = textEditor.selection.active;
    // edit.insert(currentPosition, insertContent);
}





export function get_parent_name(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const definition = try_get_definition(textEditor, edit);
    if (!definition) {
        throw Error('definition is null')
    }
    const parseResult = parse_function(definition);

    let insertContent = parseResult.name;
    let currentPosition = textEditor.selection.active;
    let quickItems: vscode.QuickPickItem[] = []
    service_position_history_add_position(currentPosition);
    update_last_used_variable(insertContent);
    edit.insert(currentPosition, insertContent);
}