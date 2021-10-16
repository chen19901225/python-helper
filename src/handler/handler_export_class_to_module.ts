import * as vscode from "vscode";
import { get_variable_list } from "../util";
import { convert_filename } from "./handler_file_name"
import * as path from "path"
import { openSync, existsSync } from "fs";
import * as fs from "fs"
let startText = '# generated_by_export_class:'
let start_file_text = "# generated_by_export_file:"

function get_selected_content_or_class_name(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit): string {
    if (!textEditor.selection.isEmpty) {
        let selection = textEditor.document.getText(textEditor.selections[0])
        return selection;
    }
    let fsPath = textEditor.document.uri.fsPath;
    let baseName = path.basename(fsPath);
    let baseNameWithoutExt = baseName.split(".")[0]
    return convert_filename(baseNameWithoutExt, "class_style");


}

function getCurrentName(textEditor: vscode.TextEditor) {
    // 获取当前的文件名
    let fsPath = textEditor.document.uri.fsPath;
    let baseName = path.basename(fsPath);
    let baseNameWithoutExt = baseName.split(".")[0]
    return baseNameWithoutExt
}
function search_init_or_create(dir_path:string): [string, string] {
    /**
     * 获取init_path的路劲和init文件的内容
     * 如果__init__文件不存在，那么先创建，在获取
     * 返回 [init的路径, init的content]
     */
    // let fsPath = textEditor.document.uri.fsPath;
    let fsPath = dir_path;
    let dirName = path.dirname(fsPath);
    // path.sep
    let initPath = dirName + `${path.sep}__init__.py`
    if (!existsSync(initPath)) {
        fs.writeFileSync(initPath, '', 'utf-8')
    }
    let read_content = fs.readFileSync(initPath, { encoding: 'utf-8' })
    return [initPath, read_content]

}


function _get_keep_lines(text: string): Array<string> {
    let lines = text.split(/\r?\n/)
    let out: Array<string> = []
    for (let line of lines) {
        if (line.startsWith("__version__")) {
            out.push(line)
        }
    }

    return out
}


function _parse_content(text: string): Array<[string, string, string]> {
    let lines = text.split(/\r?\n/)
    let parsed_lines: Array<[string, string, string]> = []
    let i = 0;
    let current_ele = []

    while (i < lines.length) {
        let currentLine = lines[i];
        currentLine = currentLine.trim();
        if (currentLine.length === 0) {
            i += 1;
            continue;
        }

        if (currentLine.startsWith(startText)) {
            let [name, exported] = currentLine.slice(startText.length).split("||");
            let nextLine = lines[i + 1];
            let expected_content = `from .${name} import ${exported}`
            if (nextLine !== expected_content) {
                throw new Error(`exported ${expected_content} got ${currentLine}`);
            }
            parsed_lines.push([startText, currentLine.slice(startText.length), nextLine]);
        }
        if(currentLine.startsWith(start_file_text)) {
            let name = currentLine.slice(start_file_text.length).trim();
            let nextLine = lines[i+1];
            let expected_content = `from . import ${name}`;
            if(nextLine !== expected_content) {
                throw new Error(`export_file expected ${expected_content} got ${name}`);
            }
            parsed_lines.push([start_file_text, currentLine.slice(start_file_text.length), nextLine])
        }
        i++;
    }
    return parsed_lines;
}

function save_content_to_path(save_path: string, lines: Array<[string, string, string]>, keep_lines: Array<string>) {
    /**
     * 根据lines重新生成__init__文件
     * keep_lines + lines + __all__
     */
    let alls = [] // __init__里面的__all__
    let content_lines = []
    for (let line of keep_lines) {
        content_lines.push(line);
    }
    for (let line of lines) {
        content_lines.push(line[0] + line[1]); // 注释行
        content_lines.push(line[2]); // 真正的内容
        content_lines.push('');

        let all_ele = line[1];
        if(line[0] === startText) {
            all_ele = line[1].split('||')[1];
        }
        // let all_ele = line[01].split('||')[1];

        alls.push(`    '${all_ele}'`);
    }
    content_lines.push("__all__ = [")
    let i = 0;
    for (i = 0; i < alls.length; i++) {
        if (i != alls.length - 1) {
            content_lines.push(`${alls[i]},`)
        } else {
            content_lines.push(alls[i]);
        }
    }
    content_lines.push("]")
    let final_content = content_lines.join("\r\n") + "\r\n";
    fs.writeFileSync(save_path, final_content, "utf-8");
}
export function export_file_to_module(fileUrl: string) {
    // 导出文件到module里面
    let [initPath, read_content] = search_init_or_create(fileUrl);
    let name = path.basename(fileUrl)
    let name_without_ext = name.split(".")[0]
    let key = name_without_ext;
    let import_statement = `from . import ${name_without_ext}`
    let parsed_lines = _parse_content(read_content);
    let keep_lines = _get_keep_lines(read_content); // 这个东西的作用?
    let is_inserted = false;

    for (let line of parsed_lines) {
        if (line[1] === key && line[0] === start_file_text) { // 如果已经插入
            is_inserted = true;
            return;
        }
    }
    parsed_lines.push([start_file_text, key, import_statement]);
    save_content_to_path(initPath, parsed_lines, keep_lines);
    vscode.window.showInformationMessage('success to export');



}

export function export_class_to_module(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    /**
     * 吧class导出到当前目录的__init__文件中
     * 
     */

    let [initPath, read_content] = search_init_or_create(textEditor.document.uri.fsPath);

    // 获取选中的文本或者当前打开文件的class名字
    let exported_content = get_selected_content_or_class_name(textEditor, edit);
    //当前打开的文件的basename
    let currentName = getCurrentName(textEditor);
    // tag
    let key = `${currentName}||${exported_content}`;
    let import_statement = `from .${currentName} import ${exported_content}`
    // List[tag, 真正的import语句]
    let parsed_lines = _parse_content(read_content);
    let keep_lines = _get_keep_lines(read_content); // 这个东西的作用?
    let is_inserted = false;

    for (let line of parsed_lines) {
        if (line[1] === key && line[0] === startText) { // 如果已经插入
            is_inserted = true;
            return;
        }
    }
    parsed_lines.push([startText, key, import_statement]);
    save_content_to_path(initPath, parsed_lines, keep_lines);
    vscode.window.showInformationMessage('success to export');


}