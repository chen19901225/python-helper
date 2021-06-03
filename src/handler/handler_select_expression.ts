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
    let lineText = document.lineAt(selection.line);
    let [flag, range] = getSelectRange(lineText.text)
    if (flag) {
        // 设置选中
        textEditor.selections = [new vscode.Selection(
            new vscode.Position(selection.line, range[0]),
            new vscode.Position(selection.line, range[1]),
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
    if (!hasFoundStart) {
        return [false, result];
    }
    let walk_flag: [boolean, number] = [true, 0];
    let fn_walk = (index: number, search_list:string[]) => {
        let textLength = lineText.length;
        let ch = lineText[index];
        let map: { [name: string]: string } = {
            "{": "}",
            "'": "'",
            '"': '"',
            "[": ']',
            "(": ")"
        }
        if (search_list.length == 0) {
            if (textLength <= index) {
                // meet lineTextEnd
                walk_flag[1] = index;
                return;
            }

            if (/[\\._a-zA-Z0-9]/.test(ch)) {
                // is normal var
                fn_walk(index + 1, search_list);
                return
            }

            if (ch in map) {
                fn_walk(index + 1, [...search_list, map[ch]]);
                return
            }

            // not match all cases
            walk_flag[1] = index;


            return;
        }
        // not found search
        if (textLength <= index) {
            walk_flag[0] = false;
            return;
        }
        if (ch != search_list[search_list.length-1]) {
            if(ch in map) {
                fn_walk(index+1, [...search_list, map[ch]])
            } else {
                fn_walk(index + 1, search_list);

            }

            return;
        }
        // ch == search
        fn_walk(index + 1, search_list.slice(0, search_list.length-1));
        return;
    }

    fn_walk(start_index, []);
    if (!walk_flag[0]) {
        return [false, result]
    }
    return [true, [start_index, walk_flag[1]]];



}