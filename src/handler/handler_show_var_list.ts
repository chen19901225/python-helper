import * as vscode from "vscode";
import { parse_function, FunctionDef } from '../parser';
import { try_get_definition } from '../util'
import { update_last_used_variable } from "./handler_last_used_variable";
export function show_var_list(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let currentPosition = textEditor.selection.active;
    let document = textEditor.document;
    // 当前行的缩进
    let currentLine = document.lineAt(currentPosition.line);
    let currentLineIndent;
    if (currentLine.isEmptyOrWhitespace) {
        currentLineIndent = currentPosition.character
    } else {
        currentLineIndent = textEditor.document.lineAt(currentPosition.line).firstNonWhitespaceCharacterIndex;
    }

    if (currentLineIndent === 0) {
        return
    }
    const definition = try_get_definition(textEditor, edit);
    if (!definition) {
        throw Error('definition is null')
    }
    const parseResult = parse_function(definition);
    let args = parseResult.args;
    if (args[0] === "self" || args[0] === "cls") {
        args = args.slice(1);
    }
    args = [...args, ...parseResult.kwargs];
    let variable;
    // if (index >= args.length) {
    //     variable = args[args.length - 1]
    // } else {
    //     variable = args[index - 1];
    // }
    let quickPickItem: vscode.QuickPickItem[] = [];
    let i = 1;
    for (let name of args) {
        quickPickItem.push({
            'label': `${i}.${name}`,
            'description': name
        })
        i += 1;
    }
    if (quickPickItem.length == 1) {
        update_last_used_variable(quickPickItem[0].description!);
        edit.insert(currentPosition, quickPickItem[0].description!);
    } else {
        vscode.window.showQuickPick(quickPickItem).then(item => {
            if (item) {
                let activeEditor = vscode.window.activeTextEditor;
                update_last_used_variable(item.description!)
                if (!activeEditor) {
                    return;
                }
                activeEditor.insertSnippet(new vscode.SnippetString(item.description), currentPosition)
                // edit.insert(currentPosition, item.description);
            }
        })

    }


    //const insert_content = generate_apply_statement(parseResult, currentLineIndent);
    // edit.insert(currentPosition, variable);

}
