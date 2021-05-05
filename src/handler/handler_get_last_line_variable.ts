import * as vscode from "vscode";
import { parse_function, FunctionDef } from '../parser';
import { update_last_used_variable } from './handler_last_used_variable'
import { get_variable_list, extraVariablePart, getLineIndent, removeVarType, leftPad } from '../util'
import { service_position_history_add_position } from "../service/service_position_history";
/**
 * 
 * 支持的功能: 
 * 1. 直接获取上一行，左行的变量
 *      如果上一行是one, two= self.one, self.two, 直接输出 `one, two`
 * 2. 只获取上一行<=当前缩进的变量
 * 如果 是以下内容
 * ```
 * one = "test"
 * if is_test:
 *     two = "test"
 * 
 * ```
 * 当indent是4的时候，获取的是`two`, 当indent=0的时候，获取的是`one`
 *  
 */
export function get_last_line_variable(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    /**
     * 改的目的假如有以下这种情况
     *      one, two = self.one, self.two
     *      one, two = created_
     * 我希望(one, two), 能有快捷键直接获取上一行的变量
     */

    /**
     * 改进2， 我希望添加缩进
     */
    let cursor = textEditor.selection.active;
    let document = textEditor.document;
    let line = document.lineAt(cursor.line);
    let currentIndent = getLineIndent(line.text);
    let beginLineNo = Math.max(cursor.line - 50, 0)
    let range = new vscode.Range(new vscode.Position(beginLineNo, 0),
        new vscode.Position(cursor.line, 0))
    let lines = document.getText(range).split(/\r?\n/);
    let [found, var_arr] = handler_get_last_line_variable__find_last_vars(lines, currentIndent);
    if (found) {
        service_position_history_add_position(cursor);
        if (var_arr.length == 1) {
            update_last_used_variable(var_arr[0])

            edit.insert(cursor, var_arr[0]);
        } else {
            // 添加 {}这种格式的东西
            // 不一定是 {a}{b}{c}的呀，可能是{a}|{b}|{c}的呀
            // show 下拉框
            let quickItems: vscode.QuickPickItem[] = []
            let index = 10;
            for (let ele of var_arr) {
                quickItems.push({
                    'label': leftPad(index, 2) + "." + ele,
                    'description': ele
                })
                index++;
            }

            vscode.window.showQuickPick(quickItems).then((item) => {
                if (item) {
                    let current_var = item.description;
                    let activeEditor = vscode.window.activeTextEditor!;

                    activeEditor.insertSnippet(new vscode.SnippetString(current_var), cursor);
                    update_last_used_variable(current_var!);
                }
            })
        }

    }


}

export function handler_get_last_line_variable__find_last_vars(lines: Array<string>, indent: number): [boolean, Array<string>] {
    for (let i = lines.length - 1; i >= 0; i--) {
        let content = lines[i];
        let lineIndent = getLineIndent(content);
        if (lineIndent > indent) {
            continue;
        }
        content = content.trim();
        if (content[0] === '#') { // 注释
            continue;
        }
        // 忽略以下面开头的行
        let escaped_start_arr = ["if ", "elif ", "for ", "while ", "def "]
        console.log("content_ele", content, content.startsWith("if "));
        let should_continue = false;
        for (let start_ele of escaped_start_arr) {
            if (content.startsWith(start_ele)) {
                should_continue = true;
                continue;
            }
        }
        if (should_continue) {
            continue;
        }
        let index = content.indexOf("=")


        if (index > -1) {
            // 忽略 a== b 或者 a!=b 这种情况

            let beforeCh = content[indent - 1];
            let nextCh = content[index + 1];
            // 忽略 a==b 这种情况
            if (nextCh === '=') {
                continue;
                // return [false, []];
            }
            if (beforeCh == '!') {
                continue
                // return [false, []];
            }
            if (["-", '+'].indexOf(beforeCh) > -1) {
                let varPart = content.slice(0, index - 1).trim();
                varPart = removeVarType(varPart);
                // update_last_used_variable(varPart);
                return [true, [removeVarType(varPart)]];
            } else {
                let vars = content.split("=")[0].trim();
                vars = removeVarType(vars);
                // update_last_used_variable(vars);
                let out_arr: Array<string> = []
                if (vars.indexOf(",") > -1) {
                    out_arr.push(vars);
                    out_arr.push(...vars.split(/,\s*/));
                } else {
                    out_arr = [vars];
                }
                return [true, out_arr];
            }

        }
    }

    return [false, []]

}
