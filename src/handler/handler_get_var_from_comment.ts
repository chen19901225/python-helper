import { posix } from "path";
import * as vscode from "vscode";

let comment_start = "# cqh_comment?"

export function get_var_from_comment_runner(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let document = textEditor.document;
    let text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount + 1, 0)));
    let currentLine = textEditor.selection.active.line;
    let [flag, comment_line, document_line] = search_previous_comment_lines(text, currentLine);
    if (flag) {
        // textEditor.in
        handle_with_comment(comment_line, document_line, textEditor.selection.active, textEditor);
    }

}

function handle_with_comment(comment_line: string, document_line: Array<string>, position: vscode.Position, activeEditor: vscode.TextEditor) {
    let select_pos = 0;
    let comment_query = comment_line.slice(comment_start.length);
    let item_list = comment_query.split("&");
    let d: { [key: string]: string } = {}
    for (let item of item_list) {
        let pair = item.split("=")
        d[pair[0]] = pair[1]
    }
    if ('pos' in d) {
        select_pos = parseInt(d['pos']);
    }
    let quick_pick_item_list: vscode.QuickPickItem[] = [];
    let index = 1;
    for (let document of document_line) {
        let pieces = document.trim().split(/\s+/);
        let element = pieces[select_pos];
        quick_pick_item_list.push({
            "label": `${index}.${element}`,
            "description": element
        })
        index += 1;

    }

    vscode.window.showQuickPick(quick_pick_item_list).then((item) => {
        if (!item) {
            return;
        }
        let { label, description } = item;
        activeEditor.insertSnippet(new vscode.SnippetString(description), position);
    })
}

function search_previous_comment_lines(text: string, currentLineNo: number): [boolean, string, Array<string>] {

    let lines = text.split(/\r?\n/);
    let comment_line: string = "";
    let document_line_list: Array<string> = []
    let is_match = false;
    for (let i = currentLineNo; i >= Math.max(0, currentLineNo - 100); i--) {
        let walk_line_text = lines[i].trim();
        if (walk_line_text.startsWith(comment_start)) {
            let previous_line_match = ["'''", '"""']
            let previous_line_text = lines[i - 1].trim();
            if (previous_line_match.indexOf(previous_line_text) > -1) { // 上一行结果是对的
                for (let j = i + 1; j < currentLineNo; j++) {
                    let j_line_text = lines[j].trim();
                    if (j_line_text === previous_line_text) { // 匹配到了结果
                        is_match = true;
                        comment_line = walk_line_text;
                        document_line_list.push(...lines.slice(i + 1, j))
                    }
                }
            }
        }

    }

    return [is_match, comment_line, document_line_list]

}