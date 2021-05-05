import * as vscode from "vscode";
import * as ts from "typescript";

/**
 * 
 *
 * 这个的作用是用来干什么来的？

 * 
 */

export function format_dict_line(lineText: string) {
    // dict(name=name, age=age)
    /**
     * 吧 dict(name=name, age=age)
     * => dict(
     *  name=name, 
     * age=age
     * )
     * 吧 name=name, age=age)
     * 变成 
     *  name=name, 
     *  age=age
     * )
     */
    let start_text = "dict("
    let is_start_with_dict = lineText.startsWith(start_text)
    let lines = ['#' + lineText]
    if(is_start_with_dict){
        lines.push(start_text)
        lineText = lineText.slice(start_text.length)
    }
    let end_text = ")"
    let is_end_with_text = lineText.endsWith(end_text);
    if(is_end_with_text){
        lineText = lineText.slice(0, lineText.length-end_text.length);
    }
    
    let prefix = ""
    if(is_start_with_dict){
        prefix = " ".repeat(start_text.length);
    }
    for (let piece of lineText.split(/,\s*/)) {
        piece = piece.trim()
        if (piece.length === 0) {
            continue;
        }
        lines.push(prefix + `${piece},`)
    }
    let last_line = lines[lines.length - 1]
    lines[lines.length - 1] = last_line.slice(0, last_line.length - 1) // 去掉最后一个的逗号
    if(is_end_with_text){
        lines.push(end_text);
    }
    return lines
}

export function format_func_line(lineText: string): Array<string> {
    lineText = lineText.trim();
    let def_text = "def"
    let lines: Array<string> = ['#' + lineText];
    let is_start_with_def_text = lineText.startsWith(def_text);
    let prefix = "";
    if(is_start_with_def_text){
        let begin_index = lineText.indexOf("(")
        if(begin_index==-1){
            throw new Error("not find ( in "+ lineText);
        }
        prefix = " ".repeat(begin_index+1);
        lines.push(lineText.slice(0, begin_index+1));
        lineText = lineText.slice(begin_index+1 ).trim();
    }
    let parethes = ")", comma=",";
    let is_end_with_parethes = lineText.endsWith(parethes);
    let is_end_with_comma = false;
    if(is_end_with_parethes){
        lineText = lineText.slice(0, lineText.length-1).trim();
    }
    is_end_with_comma = lineText.endsWith(comma);
    if(is_end_with_comma){
        lineText = lineText.slice(0, lineText.length-1).trim();
    }

    let pieces = lineText.split(/,\s*/)
    for (let piece of pieces) {
        piece = piece.trim()
        if (piece.length === 0) {
            continue;
        }
        lines.push(prefix + piece + ",")
    }
    let lastLine = lines.pop()!
    lastLine = lastLine.slice(0, lastLine.length - 1)
    lines.push(lastLine)
    if(is_end_with_comma){
        lines[lines.length-1] = lines[lines.length-1] + comma;
    }
    if(is_end_with_parethes){
        lines.push(parethes);
    }
    
    return lines

}

function format_simple_apply_line(lineText: string) {
    /**
     * a, b = 1, 2
     * => 
     * a = 1
     * b = 2
     * 
     */
    let lines: Array<string> = ['#' + lineText];
    let [left_part, right_part] = lineText.split("=");
    let left_part_arr = left_part.split(/,\s*/);
    let right_part_arr = right_part.split(/,\s*/);
    for (let i = 0; i < left_part_arr.length; i++) {
        lines.push(`${left_part_arr[i].trim()} = ${right_part_arr[i].trim()}`);
    }

    return lines;




}

export function format_apply_line(lineText: string, col: number): Array<string> {

    if (lineText.startsWith("dict(")) {// dict handler
        return format_dict_line(lineText);
    }
    if (/def\s*[^(]+\([^)]*\)?:?/.test(lineText)) {
        return format_func_line(lineText);
    }
    if (/([^=]+=[^,]+,?\s*)+/.test(lineText)) {
        return format_simple_apply_line(lineText)
    }
    if (lineText.indexOf("=") === -1) {
        return [
            lineText,
        ]
    }
    return [
        lineText,
    ]
}
export function generate_string_list(text:string): Array<string> {
    // let out = []
    let pieces = text.split(/,\s*/);
    let tmp_line = []
    for (let i = 0; i < pieces.length; i++) {
        let name = pieces[i].trim();
        tmp_line.push(`"{${name}}"`)
    }
    
    let tmp_text = '['+tmp_line.join(", ")+"]"
    return [tmp_text]
}

export function generate_dict_pair(text: string): Array<string> {
    /**
     * 把 a, b, c  =>
     *  
     * a =a, b=b, c=c
     *  把 a, b ,c) =>
     * a = a, b=b, c=c)
     */
    let out = ['#' + text];
    let equal_index = text.indexOf('=');
    if (equal_index > -1) {
        text = text.slice(0, equal_index);
        text = text.trim();
    }
    let end_text = ")"
    let is_end_with_end_text = text.endsWith(end_text)
    if(is_end_with_end_text){
        text = text.slice(0, text.length-end_text.length);
        text = text.trim();
    }
    let pieces = text.split(/,\s*/);
    let tmp_line = []
    for (let i = 0; i < pieces.length; i++) {
        let name = pieces[i];
        tmp_line.push(`${name} = ${name}`)
    }
    out.push(tmp_line.join(", "));
    if (is_end_with_end_text){
        out[out.length-1] = out[out.length-1]+end_text;
    }
    return out;
}


function _handle_var_with_label(text: string, description: string): Array<string> {

    if (description === 'dict_split_line') {
        /**
         * dict(name=b, c=d) 
         * 
         * dict(name=b,
         *      c=d)
         * 
         */
        return format_dict_line(text);
    }

    if (description === 'def_arg_split_line') {
        return format_func_line(text);
    }

    if (description === 'apply_split_line') {
        return format_simple_apply_line(text);
    }

    if (description === 'generate_dict_pair') {
        return generate_dict_pair(text);
    }

    if (description === 'generate_string_list') {
        return generate_string_list(text);
    }
    throw Error(`unkown desc [${description}]`)
}





export function node_format(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let cusor = textEditor.selection.active;

    if (!textEditor.selection.isEmpty) {
        cusor = textEditor.selections[0].start;
    }
    let line = textEditor.document.lineAt(cusor.line);
    let lineText = line.text;
    let range = new vscode.Range(cusor, line.range.end);

    let items: vscode.QuickPickItem[] = [];
    items.push({
        'label': 'generate_dict_pair',
        'description': 'generate_dict_pair'
    });

    items.push({
        'label': 'def_arg_split_line',
        'description': 'def_arg_split_line'
    });

    items.push({
        'label': 'dict_split_line',
        'description': 'dict_split_line'
    })
    items.push({
        'label': 'apply_split_line',
        'description': 'apply_split_line'
    })
    items.push({
        'label': 'generate_string_list',
        'description': 'generate_string_list'
    })

    let indexLength = 2;
    let formatIndex = (index: number): string => {
        let prefix = '0'.repeat(indexLength) + index.toString()
        return prefix.slice(prefix.length - indexLength);
    }
    for (let i = 0; i < items.length; i++) {
        let prefix = formatIndex(i);
        items[i].label = prefix + '.' + items[i].label;
    }


    let selectedText = lineText.slice(cusor.character);

    vscode.window.showQuickPick(items).then((item) => {
        if (!item) {
            return;
        }
        let { description } = item;
        let replaced_lines = _handle_var_with_label(selectedText, description!);

        let prefix = " ".repeat(cusor.character);
        for (let i = 1; i < replaced_lines.length; i++) {
            replaced_lines[i] = prefix + replaced_lines[i];
        }
        let content = replaced_lines.join("\n")


        let newPosition_col = replaced_lines[replaced_lines.length - 1].length
        let newPosition_row = cusor.line - 1 + replaced_lines.length;
        textEditor.edit((builder) => {
            builder.replace(range, content);
        }).then((success) => {
            let newPosition = new vscode.Position(newPosition_row, newPosition_col);
            textEditor.selection = new vscode.Selection(newPosition, newPosition);
        })

    })



    /*
    let replaced_lines = format_apply_line(lineText.slice(cusor.character), 0);
    let prefix = " ".repeat(cusor.character);
    for (let i = 1; i < replaced_lines.length; i++) {
        replaced_lines[i] = prefix + replaced_lines[i];
    }
    let content = replaced_lines.join("\n")


    let newPosition_col = replaced_lines[replaced_lines.length - 1].length
    let newPosition_row = cusor.line - 1 + replaced_lines.length;
    textEditor.edit((builder) => {
        builder.replace(range, content);
    }).then((success) => {
        let newPosition = new vscode.Position(newPosition_row, newPosition_col);
        textEditor.selection = new vscode.Selection(newPosition, newPosition);
    })
    */
}