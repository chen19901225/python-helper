/**
 *
 *
 * case 1 `'name': abcdddd`  select 'abcdddddd'
 * case 2 `'name': abcde,` select 'abcdefdfsdfs'
 *
 */
import * as vscode from "vscode";
export function select_expression(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {

    let selection = textEditor.selection.active;
    let document = textEditor.document;

    let quickitemList: vscode.QuickPickItem[] = [];
    // for()
    quickitemList.push({
        "label": "01.right_part",
        "description": "right_part"
    })
    let activeEditor = vscode.window.activeTextEditor;
    let lineText = document.lineAt(selection.line);
    select_right_part(selection.line, lineText.text, activeEditor!);
    return;
    

    vscode.window.showQuickPick(quickitemList).then(item => {
        if (item) {
            let activeEditor = vscode.window.activeTextEditor;
            let lineText = document.lineAt(selection.line);
            let description = item.description!;
            if (description === "right_part") {
                select_right_part(selection.line, lineText.text, activeEditor!);
                return;
            }
            

            // activeEditor.insertSnippet(new vscode.SnippetString(item.description), currentPosition)

            // edit.insert(currentPosition, item.description);
        }
    })








}
function select_right_part(line: number, text: string, textEditor: vscode.TextEditor) {
    let [flag, range] = getSelectRange(text)
    if (flag) {
        // 设置选中
        textEditor.selections = [new vscode.Selection(
            new vscode.Position(line, range[0]),
            new vscode.Position(line, range[1]),
        )]
    }
}

export function getSelectRange(lineText: string): [boolean, [number, number]] {
    let start_index = -1;
    let flag = false;
    let result: [number, number] = [0, 0];
    let index = 0
    for (let ch of lineText) {
        if (ch == ":") {
            flag = true;
            start_index = index;
            break;
        }
        if (ch == "=") {
            // match models.Name==record.user.name
            flag = true;
            if (lineText[index + 1] == "=") {
                start_index = index + 1;
            } else {
                start_index = index;
            }
            break;
        }
        index += 1;
    }
    if (!flag) {
        return [flag, result];

    }
    let comma_index = start_index;
    let hasFoundStart = false;
    for (let i = 0; i < lineText.length; i++) {
        let ch = lineText[i];
        if (i < start_index) {
            continue;
        }
        if (/[_A-Za-z]/.test(ch)) {
            start_index = i;
            hasFoundStart = true;
            break
        }
    }

    for (let j = lineText.length - 1; j >= 0; j--) {
        let ch = lineText[j];
        if (/[_A-Za-z0-9]/.test(ch)) {
            return [true, [start_index, j + 1]];
        }
        if ([")", "]", "'", '"'].indexOf(ch) > -1) {
            return [true, [start_index, j + 1]];
        }
    }

    // return [true, [start_index, walk_flag[1]]]
    return [false, [0, 0]]



}