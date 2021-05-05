import * as vscode from "vscode";
import { parse_function, FunctionDef } from '../parser';
import { try_get_definition } from '../util'
export function function_apply_self(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
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
    if (definition == null) {
        throw Error("cannot get definition");
    }
    const parseResult = parse_function(definition);
    // if(parseResult == null) {
    //     throw Error("")
    // }
    const insert_content = generate_apply_statement(parseResult, currentLineIndent);
    edit.insert(currentPosition.translate(0, -1 * currentPosition.character), insert_content);
    // let position = textEditor.selection.active;

    // const editor = vscode.window.activeTextEditor;
    // const afterInsertCusorPosition = editor.selection.active;
    // const AfterInsertLine = document.lineAt(afterInsertCusorPosition.line);

}

function generate_apply_statement(parseResult: FunctionDef, currentLineIndent: number) {
    let lines = [];
    for (let name of parseResult.args) {
        if (['self', 'cls'].indexOf(name) > -1) {
            continue;
        }
        lines.push(`self.${name} = ${name}`);
    }
    for (let name of parseResult.kwargs) {
        lines.push(`self.${name} = ${name}`)
    }
    let indexstr = ' '.repeat(currentLineIndent);
    let convert_lines = []
    for (let line of lines) {
        convert_lines.push(indexstr + line);
    }
    return convert_lines.join('\n') + '\n';
}


function getIndent(text: string) {
    const match = text.match(/^\s+/);
    if (!match) {
        return 0;
    }
    return match[0].length;
}