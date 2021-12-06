/**
 * 
 * impport 还是保存到project里面去吧,不然的话,太麻烦了
 */
import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import { Persist } from "../persist";
import { get_workspace_path, split_file_content } from "../util";

export function handle_import_add_selected(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let workspace_dir = get_workspace_path();
    let document = textEditor.document;
    if (textEditor.selection.isEmpty) {
        vscode.window.showErrorMessage("请选中内容");
        return;
    }
    let selected_text = document.getText(new vscode.Range(textEditor.selection.start, textEditor.selection.end));
    if (selected_text) {
        Persist.saveCmdStr(workspace_dir, selected_text);
        vscode.window.showInformationMessage(`成功保存text:[${selected_text}]`);
    }

}




let handle_line = (i: number, lines: string[]): [boolean, number] => {

    let handle_comment = (i: number) => {
        return i + 1;
    }

    let handle_empty = (i: number) => {
        return i + 1;
    }

    let handle_string = (i: number) => {
        return i + 1;
    }
    let handle_single_string = (i: number) => {
        return i + 1;
    }
    let handle_multiple_string = (i: number) => {
        i = i + 1;
        let line;
        while (1) {
            // line = document.lineAt(i).text;
            line = lines[i];

            if (line == '"""') {
                break;
            } else {
                i = i + 1;
            }
        }
        return i + 1;
    }
    let handle_multiple_single_string = (i: number) => {
        i = i + 1;
        let line;
        while (1) {
            // line = document.lineAt(i).text;
            line = lines[i]
            if (line == "'''") {
                break;
            } else {
                i = i + 1;
            }
        }
        return i + 1;
    }

    // let line = document.lineAt(i).text;
    let line = lines[i];
    if (Object.is("", line.trim())) {
        return [false, handle_empty(i)];
    }
    if (line.startsWith('#')) {
        return [false, handle_comment(i)];
    }



    if (line.startsWith('"""')) {
        return [false, handle_multiple_string(i)];
    }

    if (line.startsWith("'''")) {
        return [false, handle_multiple_single_string(i)];
    }
    if (line.startsWith('"')) {
        return [false, handle_string(i)];
    }
    if (line.startsWith("'")) {
        return [false, handle_single_string(i)];
    }
    return [true, i];

}

function is_import_line(line: string): boolean {
    if (line.startsWith("import ")) {
        return true;
    }
    if (line.startsWith("from ")) {
        let pieces = line.split(/\s+/)
        return pieces[2] == "import"
    }

    return false;
}

function find_code_line_no(lines: string[]): number {
    // 获取正式代码行的位置
    let len = lines.length
    let i = 0
    while (i < len) {
        let [flag, next_i] = handle_line(i, lines)
        if (!flag) {
            i = next_i
            continue
        }
        if (next_i >= len) {
            // 已经到了最后
            return next_i
        }
        // flag==true,的时候next_i==i
        let line = lines[i]
        if (is_import_line(line)) {
            i = i + 1
        } else {
            // 不是import的内容
            return i
        }

    }
    return lines.length;
}
function is_text_exported(lines: string[], selected_text: string): boolean {
    //判断selected_text是否已经导出
    let len = lines.length;
    let i = 0;
    while (i < len) {
        let [flag, next_i] = handle_line(i, lines)
        if (!flag) {
            i = next_i
            continue
        }
        let line = lines[i]
        if (line.startsWith("import")) {
            return line.split(/\s+/g)[1] == selected_text
        }
        // from x import abc
        let import_list = line.split(/\s+/g)[1].split(/,\s+/g)
        return import_list.indexOf(selected_text) > -1

    }
    return false;


}

export function handle_import_insert_import(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    // 尝试不需要这个end_line
    // 我来改一下
    let workspace_dir = get_workspace_path();
    let current_path = textEditor.document.uri.fsPath;
    let document = textEditor.document;
    if (textEditor.selection.isEmpty) {
        vscode.window.showErrorMessage("请选中内容");
        return;
    }
    let selected_text = document.getText(new vscode.Range(textEditor.selection.start, textEditor.selection.end));
    // 获取到正式的代码行
    let content = fs.readFileSync(current_path, 'utf-8')
    let lines = content.split(/\r?\n/g)


    let code_line_no = find_code_line_no(lines)
    let import_lines: string[] = []
    let other_lines: string[] = []
    // 生成两部分list
    let choice_list = [import_lines, other_lines]
    //  for(let i=0;i<code_line_no;i++)
    for (let i = 0; i < lines.length; i++) {
        let insert_index = 0
        if (i >= code_line_no) {
            insert_index = 1
        }
        choice_list[insert_index].push(lines[i])
    }


    // 把import的行的列表检查一下,如果不重复,那么就插入
    if (is_text_exported(import_lines, selected_text)) {
        vscode.window.showErrorMessage(`selected_text已经导出 selected_text:[${selected_text}]`)
        return;
    }


    // 重新生成

    let cmd_list: string[] = Persist.loadFromProj(workspace_dir);
    let ljust = (value_str: string, count: number): string => {
        let prefix = "0".repeat(count)
        let new_str = value_str + prefix
        return new_str.slice(new_str.length - count);
    }
    cmd_list = cmd_list.filter((o) => {
        return o.indexOf(selected_text) > -1
    })
    if (cmd_list.length == 0) {
        vscode.window.showErrorMessage(`没有找到selected_text: [${selected_text}]`);
        return
    }
    let quickItemList: vscode.QuickPickItem[] = []
    let i = 1;
    for (let cmd of cmd_list) {
        quickItemList.push({
            "label": ljust(i + "", 2) + ". " + cmd,
            "description": cmd
        })
        i++;
    }
    vscode.window.showQuickPick(quickItemList).then((item) => {
        if (item) {
            let current_var = item.description!;
            // let activeEditor = vscode.window.activeTextEditor!;
            //  middleLines.push(current_var);
            // firstLines.push(current_var)
            import_lines.push(current_var)
            let new_content = [import_lines.join(os.EOL), other_lines.join(os.EOL)].join(os.EOL)
            fs.writeFileSync(current_path, new_content, 'utf-8')
            vscode.window.showInformationMessage(`添加import成功 [${current_var}]`)
        }
    })



}