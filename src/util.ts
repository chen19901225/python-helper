import * as vscode from 'vscode'

export function try_get_definition(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {

    let currentPosition = textEditor.selection.active;
    let document = textEditor.document;
    let currentLine = document.lineAt(currentPosition.line);
    let currentMinIndent
    if (currentLine.isEmptyOrWhitespace) {
        //如果当前行为空
        currentMinIndent = currentPosition.character
    } else {
        currentMinIndent = textEditor.document.lineAt(currentPosition.line).firstNonWhitespaceCharacterIndex;
    }

    // 当前行的缩进

    if (currentMinIndent === 0) {
        return
    }
    let defLineNo = -1;
    for (let i = currentPosition.line; i >= 0; i--) {
        let warkLine = textEditor.document.lineAt(i);
        if (warkLine.isEmptyOrWhitespace) {
            continue;
        }
        let warkLineIndex = warkLine.firstNonWhitespaceCharacterIndex;

        if (warkLineIndex >= currentMinIndent) {
            continue;
        }
        // if (warkLineIndex)
        // 为什么要min呢？
        // currentMinIndent = Math.min(warkLineIndex, currentMinIndent);
        let contentWithoutIndent = warkLine.text.trim();
        if (contentWithoutIndent.startsWith("def ") || contentWithoutIndent.startsWith("async def")) {
            defLineNo = i;
            break;
        }
    }
    if (defLineNo === -1) {
        throw Error("cannot find def");
    }
    // 找到defLineNo之后， 开始找def的结束
    let defEndLineNo = -1;
    for (let i = defLineNo; i <= currentPosition.line; i++) {
        let iterLine = document.lineAt(i);
        if (iterLine.text.match(/\)(\s*->\s*[ \w,\[\]\.]*\s*)?:\s*$/)) {
            defEndLineNo = i;
            break;
        }

    }
    if (defEndLineNo === -1) {
        throw Error("cannot find def end line");
    }

    const defStartPosition = new vscode.Position(defLineNo, document.lineAt(defLineNo).firstNonWhitespaceCharacterIndex);
    const defEndPosition = new vscode.Position(
        defEndLineNo,
        document.lineAt(defEndLineNo).range.end.character
    )



    // 获取到定义之后， 就应该parse定义了
    const definition = document.getText(new vscode.Range(defStartPosition,
        defEndPosition));
    return definition;
}

class LineExtractor {
    index: number;
    element_list: Array<string> = [];
    run: string;
    constructor(public line: string) {
        this.index = 0;
        this.run = "";
    }
    loop() {
        while (1) {
            if (this.index === this.line.length) {
                if (this.run && this.run.length > 0) {
                    this.element_list.push(this.run);

                }
                return;
            }
            this.step()

        }
    }
    step() {
        let ch = this.line[this.index];
        if (ch.match(/[_a-zA-Z0-9.]/)) {
            this.run += ch;
            this.index += 1;
            return;
        }
        if (ch === '"' || ch === "'") {
            this.run += ch;
            this.index += 1;
            this.walk_until(ch)
            return;
        }
        if (ch === "[") {
            this.run += ch;
            this.index += 1;
            this.walk_until("]")
            return;
        }
        if (ch == "(") {
            this.run += ch;
            this.index += 1;
            this.walk_until(")")
            return;
        }
        if (ch == "*") {
            this.run += ch;
            this.index +=1;
            return;
        }
        
        if (this.run && this.run.length > 0) {
            this.element_list.push(this.run)
            this.run = ""
        }
        
        this.index += 1;


    }

    walk_until(search: string) {

        while (1) {
            let ch = this.line[this.index];
            if (ch === undefined) {
                return;
            }
            this.run += ch;
            this.index += 1;

            if (ch === search) {
                break;
            }

        }



    }
}

export function get_variable_list(line: string): Array<string> {
    let obj = new LineExtractor(line);
    obj.loop()
    return obj.element_list;
}

export function getLineIndent(line: string) {
    let i;
    for (i = 0; i <= line.length; i++) {
        if (line[i] != " ") {
            return i;
        }
    }
    throw Error(`lin error [${line}]`)
}

export function extraVariablePart(var_and_function: string) {
    let final_result = [];
    for (let ele of var_and_function.split(".")) {
        if (ele.includes("(") && ele.includes(")")) {
            break;
        } else {
            final_result.push(ele);
        }
    }
    return final_result.join(".")
}

export function removeVarType(var_and_type: string): string {
    // export function format(text: string): string {

    // }
    if (var_and_type.includes(":")) {
        let part: string = var_and_type.split(":").shift()!;

        return part;
    } else {
        return var_and_type;
    }
}

export function leftPad(ele: number, count: number): string {
    let prefix = '0'.repeat(count);
    let final_ele = prefix + ele
    return final_ele.slice(final_ele.length - count)
}