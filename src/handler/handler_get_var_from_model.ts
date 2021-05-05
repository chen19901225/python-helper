import { posix } from "path";
import * as vscode from "vscode";

let comment_start = "# cqh_comment?"

/**
 *如何确定开始行呢， 开始行以`class ` 开头，并且没有空格
 *
 * 
 *
 */
export function get_var_from_model(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let document = textEditor.document;
    let text = document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount + 1, 0)));
    let currentLine = textEditor.selection.active.line;
    let lines = text.split(/\r?\n/);
    let [flag, comment_line, document_line] = search_previous_model_lines(lines, currentLine);
    let currentLineText = text[currentLine]
    if (currentLineText.startsWith("def ")) { // 匹配的是function
        // def method(self or cls, ***)
        if (flag) {

            handle_with_model([], document_line, textEditor.selection.active, textEditor);
        }

    } else {
        let [found_dict, dict_line_list] = search_previous_dict_lines(lines, currentLine);
        /**
         * 如果found_dict是true的话，就是匹配
         */
        if (flag) {
            // textEditor.in
            handle_with_model(dict_line_list, document_line, textEditor.selection.active, textEditor);
        }
    }


}

function replaceTArray(arr: Array<string>): Array<string> {
    let out = []
    for (let line of arr) {
        line = line.replace("\t", "    ")
        out.push(line)
    }
    return out;
}

function getFirstCharPos(line: string) {
    for (let i = 0; i < line.length; i++) {
        let ch = line[i];
        if (/[a-zA-Z]/.test(ch)) {
            return i;
        }
    }
    return -1;
}


function get_dict_name_list(dict_line_list: Array<string>): Array<string> {
    /**
     * name=call(
     *      show,
     *      )
     * 这个格式的我搞不定，也不想搞，留着以后搞吧
     */
    let out: Array<string> = []
    let meta = [true, 0]
    for (let line of dict_line_list) {
        let firstCharPos = getFirstCharPos(line);
        if (firstCharPos > -1) {
            if (meta[0] === true) {
                meta[0] = false;
                meta[1] = firstCharPos;

            } else {
                if (firstCharPos > meta[1]) {
                    continue;
                }
            }
            let name = line.split("=")[0].trim();
            out.push(name)
        }


    }
    return out;
}


function handle_with_model(dict_line_list: Array<string>, document_line: Array<string>, position: vscode.Position, activeEditor: vscode.TextEditor) {
    let select_pos = 0;
    dict_line_list = replaceTArray(dict_line_list)
    document_line = replaceTArray(document_line);
    let dict_name_array = get_dict_name_list(dict_line_list);


    let quick_pick_item_list: vscode.QuickPickItem[] = [];
    let index = 1;
    let meta = [true, 0]
    for (let document of document_line) {
        let firstChPos = getFirstCharPos(document);
        if (firstChPos == -1) {
            continue;
        }
        if (meta[0] === true) {
            meta[0] = false;
            meta[1] = firstChPos
        } else {
            if (firstChPos > meta[1]) {
                continue;
            }
        }
        document = document.trim();
        if (document.startsWith("#")) {
            // 忽略注释
            continue
        }
        let pieces = document.split("=")
        let element = pieces[0].trim();
        if (dict_name_array.indexOf(element) > -1) {
            continue;
        }
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

function search_previous_dict_lines(lines: Array<string>, currentLineNo: number): [boolean, Array<string>] {
    // 找到 dict()

    let dict_line_list: Array<string> = []
    let is_match = false;
    for (let i = currentLineNo; i >= Math.max(0, currentLineNo - 100); i--) {
        let walk_line_text = lines[i].trim()
        if (walk_line_text.endsWith("dict(")) {
            is_match = true;
            dict_line_list.push(
                ...lines.slice(i + 1, currentLineNo)
            )
            break;
        }
    }

    return [is_match, dict_line_list]

}




function search_previous_model_lines(lines: Array<string>, currentLineNo: number): [boolean, string, Array<string>] {


    let comment_line: string = "";
    let document_line_list: Array<string> = []
    let is_match = false;
    for (let i = currentLineNo; i >= Math.max(0, currentLineNo - 100); i--) {
        let walk_line_text = lines[i].trim();
        if (lines[i].startsWith('class ')) {
            // document_line_list.push(...lines.slice(i+1, ))
            // 找到结束行 class Meta 或者 # __model_end__
            //
            // 处理掉
            var startIndex = i + 1;
            let startLineText = lines[startIndex];
            let max_comment_line_count = 100
            let triple_quote_arr = ["'''", '"""']
            for (let quote of triple_quote_arr) {
                if (startLineText === quote) {
                    let is_found = false;
                    for (let k = i + 1; k < i + max_comment_line_count; k++) {
                        let k_line_text = lines[k];
                        if (k_line_text === quote) {
                            is_found = true;
                            startIndex = k + 1;
                            break;
                        }
                    }
                    if (!is_found) {
                        vscode.window.showErrorMessage(`不能找到 quote [${quote}]`);
                        throw new Error("不能找到 quote [${quote}]")
                    }
                }
            }

            while (1) {
                startLineText = lines[startIndex];
                if (startLineText.startsWith("'") || startLineText.startsWith('"')) {
                    startLineText += 1
                } else {
                    break
                }
            }


            for (let j = i + 1; j < currentLineNo; j++) {
                let j_line_text = lines[j].trim();
                // 结束行，class Meta 或者 # __model_end__
                if (j_line_text.startsWith("class Meta") || j_line_text === "# __model_end__") {
                    is_match = true;
                    comment_line = walk_line_text;
                    document_line_list.push(...lines.slice(i + 1, j))
                    break;
                }

            }

        }

    }

    return [is_match, comment_line, document_line_list]

}