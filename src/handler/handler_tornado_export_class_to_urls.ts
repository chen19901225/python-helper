
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import *as os from "os";
import { convert_filename } from "./handler_file_name";
let line_sep = os.EOL;
let name_re = /^name\s*=\s*(.+)$/
export async function tornado_export_class_to_urls(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {

    /**
     * torando吧handler导出到urls里面
     * 
     */
    let handler_path = textEditor.document.uri.fsPath;
    let handler_directory = path.dirname(handler_path);
    let urls_path = path.join(handler_directory, 'urls.py');
    if (!fs.existsSync(urls_path)) {
        // 创建文件内容
        let confirm = await vscode.window.showInputBox({
            prompt: 'Please specify the filename of the image.',
            value: 'url_pattern_list' // 默认值
        })
        if (!confirm) {
            vscode.window.showErrorMessage("confirm is null " + confirm);
            return;
        }
        fs.writeFileSync(urls_path,
            `${confirm} = [

            ]
            `, 'utf-8');

    }

    let content = fs.readFileSync(urls_path, 'utf-8');
    let handler_content = fs.readFileSync(handler_path, 'utf-8');
    let name = null;
    let handler_lines = handler_content.split(line_sep);
    for (let i = 0; i < handler_lines.length; i++) {
        let current_line = handler_lines[i];
        let name_match = current_line.match(name_re);
        if (name_match) {
            name = name_match[1].trim();
            name = name.slice(1, name.length - 1);
            break;
        }
    }
    if (!name) {
        vscode.window.showErrorMessage("没有找到handler里面的name");
        return;
    }
    let baseName = path.basename(handler_path).split(".")[0];
    let className = convert_filename(baseName, "class_style");

    let [flag, final_content] = generate_urls_content(content, name,
        baseName
    )
    if (!flag) {
        vscode.window.showErrorMessage("生成urls内容错误 " + final_content);
        return;
    }
    fs.writeFileSync(urls_path, final_content, 'utf-8');
    vscode.window.showInformationMessage("导出成功");

}

/**
 * 
 * @param content 原始内容
 * @param name url的名字
 * @param className 类名
 */
export function generate_urls_content(content: string, name: string, baseName: string): [boolean, string] {
    let [flag, error_msg, var_name, import_array, var_array, left_array] = _parse_urls_content(content);
    if (!flag) {
        return [false, error_msg];
    }
    let add_to_array = (array: Array<string>, insert_lines: [string, string, string]) => {
        let should_insert = true;
        for (let i = 0; i < array.length - 2; i++) {
            if (array[i] == insert_lines[0] && array[i + 2] == insert_lines[2]) {
                should_insert = false;
                break;
            }
        }
        if (should_insert) {
            array.push('');
            array.push(...insert_lines);
        }
    }
    let className = convert_filename(baseName, 'class_style');
    let fixed_name = name
    if(fixed_name.indexOf("(") > -1) {
        // api/callback__test__(.*) => api/callback__test__
        fixed_name = fixed_name.slice(0, fixed_name.indexOf("("))
    }
    add_to_array(import_array, [
        `#generated_import_start: ${className}`,
        `from .${baseName} import ${className}`,
        `#generated_import_end: ${className}`]);
    let url_path = '/' + name.replace(/__/g, '/').replace(/\-/g, '/');
    add_to_array(var_array, [
        `    #generate_route_start: ${name}`,
        `    ("${url_path}", ${className}, {}, "${fixed_name}"),`,
        `    #generate_route_end: ${name}`])

    let lines = [];
    import_array.forEach((value) => {
        lines.push(value);
    })
    lines.push("");
    lines.push(`${var_name} = [`);
    var_array.forEach((value) => {
        lines.push(value);
    })
    lines.push("]");
    left_array.forEach((value) => {
        lines.push(value);
    })
    lines.push("");
    return [true, lines.join(line_sep)];
}

export function _parse_urls_content(content: string): [boolean, string, string, Array<string>,
    Array<string>, Array<string>] {

    let var_name = null,
        import_lines: Array<string> = [],
        var_lines: Array<string> = [],
        left_lines: Array<string> = [];
    let var_regex = /^(.*)\s*=(.*)/
    let lines = content.split(line_sep);
    let var_index = 0;
    for (let i = 0; i < lines.length; i++) {
        let current_line = lines[i];
        let match = current_line.match(var_regex);
        if (match) {
            var_name = match[1].trim();
            var_index = i;
            if (current_line.indexOf("(") > -1) {
                return [
                    false, "=这一样不能有(",
                    "",
                    import_lines,
                    import_lines,
                    left_lines
                ]
            }
            break;
        }
    }
    if (!var_name) {
        return [false, "var_name没有找到", "", import_lines, var_lines,
            left_lines]
    }

    let end_text = "]";
    if (var_index > 0) {
        // 导入的lines
        import_lines = lines.slice(0, var_index);
    }
    let end_index = 0
    for (let i = var_index + 1; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim() == end_text) {
            end_index = i;
            break;
        }
    }
    if (end_index > var_index + 1) {
        var_lines = lines.slice(var_index + 1, end_index);
    }

    if (end_index < lines.length - 1) {
        left_lines = lines.slice(end_index + 1)
    }

    return [true, "", var_name, import_lines, var_lines, left_lines]
}
