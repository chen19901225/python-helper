import * as vscode from "vscode";
import { leftPad, removeVarType } from "../util"
import { service_position_history_add_position } from "../service/service_position_history";

function _format(text: string): string {
    let origin = removeVarType(text)
    return origin.trim()
}



export function get_insert_context(text: string): [boolean, string] {
    if (text.indexOf("==") > -1) {
        let pattern = text.split("==")[0];
        return [true, _format(pattern)];
    }
    let match = /^\s*([^=]+)=.*$/.exec(text);
    if (match) {
        // 获取=左边的内容
        let pattern = match[1];
        // edit.insert(position, pattern.trim());
        if (pattern.startsWith("if ") && pattern.endsWith("!")) {
            // 处理 if name !=
            pattern = pattern.slice(2, pattern.length - 1)
        }
        if (pattern.startsWith("dict(")) {
            // 处理 dict(name=)
            pattern = pattern.slice("dict(".length)
            pattern = pattern.trim();
        }
        return [true, _format(pattern)];
        // return;
    }
    match = /^\s*'([^']+)'\:.*$/.exec(text);
    if (match) {
        // {
        //  'a':
        // }
        let pattern = match[1];
        // edit.insert(position, pattern.trim());
        return [true, _format(pattern)];
        // return;
    }

    match = /^\s*"([^"]+)"\:.*$/.exec(text);
    if (match) {
        // 获取 "a":
        let pattern = match[1];

        // edit.insert(position, pattern.trim());
        return [true, _format(pattern)];
        // return;
    }
    // 
    // 匹配("a","")
    match = /^\s*\("([^"]+)"\s*,.*$/.exec(text)
    if (match) {
        let pattern = match[1];
        return [true, _format(pattern)];
    }
    return [false, ""]
}

export function insert_left_pattern(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {

    let position = textEditor.selection.active;
    service_position_history_add_position(position);
    let currentLine = textEditor.document.lineAt(position.line);
    let text = currentLine.text.trim();
    let [found, inserted_text] = get_insert_context(text);
    if (found) {
        let convert_list = left_pattern_convert_list(inserted_text)
        if (convert_list.length == 1) {
            edit.insert(position, inserted_text);
            return;
        }
        let quickPickItem: vscode.QuickPickItem[] = [];
        let index = 0;
        for (let word of convert_list) {
            quickPickItem.push({
                "label": leftPad(index, 2) + ". " + word,
                "description": word
            });
            index += 1;
        }
        vscode.window.showQuickPick(quickPickItem).then((item) => {
            if (item) {
                let activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    return;
                }
                activeEditor.insertSnippet(new vscode.SnippetString(item.description), position);
            }
        })

    }
    // if(/^[^=]+=.+$/.test())


    // let content_list = currentLine.text.split("=")
    // let left_pattern = content_list[0];

}
export function left_parttern_split_text_by_underline(text: string): Array<string> {
    let out: Array<string> = []
    out.push(text);
    let split_arr: Array<string> = text.split("__");
    if (split_arr.length > 1) {
        // 如果是1的话，会两次添加text
        for (let i = 0; i < split_arr.length; i++) {
            // let arr_piece = split_arr.slice(i);
            // out.push(arr_piece.join("__"));
            let piece = split_arr[i];
            if (piece) {
                out.push(piece);
            }
        }
    }


    return out
}

export function left_pattern_convert_list(param: string): Array<string> {

    /**
     * 
     * 暂时只处理几种情况
     * 1. this.name = d => this.name =d.name
     * 2. this.d["name"] = d => this.d["name"] = d.name
     * 3. d["name"] = c. => d["name"] = c.name
     * 4. ("a", ) => show a
     * 5. cls.name == 
     */

    let out: Array<string> = []
    let handle_text = param;
    let count_ch = (source: string, search_ch: string): number => {
        let num = 0;
        for (let ch of source) {
            if (ch === search_ch) {
                num++;
            }
        }
        return num;
    }
    if (param.startsWith("(")) {
        param = param.trim();
        if (param.endsWith(",")) {
            let element = param.slice(1, param.length)
            element = element.trim();
            out.push(element.slice(1, element.length))
            return out;
        }
    }
    if (count_ch(param, ".") > 1) {
        // 只处理这种 this.name.test, 不处理this.name__test.d 中的name__test
        let slice = param.split(".")
        let out = []
        for (let i = slice.length; i >= 2; i--) {
            out.push(slice.slice(0, i).join("."))
        }
        out.push(...slice);
        return out;
        // return [param, ]
    }

    if (count_ch(param, '[') > 1) {
        // 只提取多个里面的[]
        let trim_part = (param_text: string) => {
            if (param_text.endsWith("]")) {
                param_text = param_text.slice(0, param_text.length - 1);
            }
            if (param_text.startsWith("'") && param_text.endsWith("'")) {
                param_text = param_text.slice(1, param_text.length - 1);
            }
            if (param_text.startsWith('"') && param_text.endsWith('"')) {
                param_text = param_text.slice(1, param_text.length - 1);
            }
            return param_text;
        }
        let out: Array<string> = []
        // out.push(param)
        let piece_list = param.split("[")
        for (let i = piece_list.length; i >= 2; i--) {
            out.push(piece_list.slice(0, i).join("["))
        }
        for (let piece of piece_list) {
            out.push(trim_part(piece));
        }


        return out

    }

    if (count_ch(param, ".") > 1 || count_ch(param, "[") > 1) {
        // 不处理太过于复杂的东西
        return [param]
    }
    let split_element_by_underline = (text: string): Array<string> => {
        // 切割 name__d => ["name__d", "name", "d"]
        let out: Array<string> = []
        let split_arr: Array<string> = text.split("__");

        return out

    }

    let dot_index = handle_text.indexOf(".")
    let square_index = handle_text.indexOf("[")
    if (dot_index == -1 && square_index == -1) {
        // 那么就应该只有
        out.push(...left_parttern_split_text_by_underline(handle_text));
        return out
    }
    if (dot_index == -1) {
        // 只有[]
        out.push(handle_text)
        let prefix_part = handle_text.slice(0, square_index);
        out.push(prefix_part);
        handle_text = handle_text.slice(square_index + 1, handle_text.length - 1); // 去掉[]
        handle_text = handle_text.slice(1, handle_text.length - 1); // 去掉"" 或者''
        out.push(...left_parttern_split_text_by_underline(handle_text));
        return out

    }
    if (square_index == -1) {
        // 只有.
        // 只处理this.name这种，不处理this.name__eq 这种
        // out.push()
        out.push(handle_text)
        let prefix_part = handle_text.slice(0, dot_index);
        out.push(prefix_part);
        let last_part: string = handle_text.split(".")[1]; // 只处理一个.的东西
        out.push(...left_parttern_split_text_by_underline(last_part));
        return out
    }
    if (dot_index < square_index) {
        // ex: this.dict["test"]
        // 这个和只处理dict一样
        out.push(handle_text)
        let prefix_part = handle_text.slice(0, square_index);
        out.push(prefix_part);

        handle_text = handle_text.slice(square_index + 1, handle_text.length - 1); // 去掉[]
        handle_text = handle_text.slice(1, handle_text.length - 1); // 去掉"" 或者''
        out.push(...left_parttern_split_text_by_underline(handle_text));
        return out
    }



    return out;
}