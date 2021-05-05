import * as vscode from "vscode";
export function move_op_end(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let position = textEditor.selection.active;
    let line = textEditor.document.lineAt(position.line)
    let currentText = line.text.substring(line.firstNonWhitespaceCharacterIndex,
        position.character)
    let quickItemList: vscode.QuickPickItem[] = [];
    let quote_choices = [
        ["'", "单引号"],
        ['"', "双引号"]
    ]
    let charCount = (line: string, char: string) => {
        let count = 0;
        for (let lineChar of line) {
            if (lineChar === char) {
                count++
            }
        }
        return count
    }
    for (let [quote, desc] of quote_choices) {
        if (charCount(currentText, quote) % 2 === 1) {
            quickItemList.push({
                'label': quote,
                "description": desc
            })
        }
    }
    let other_choices = [
        ["[", "]", "方括号"],
        ["(", ")", "括号"],
        ["{", "}", "花括号"],
    ]
    for (let [begin, end, desc] of other_choices) {
        if (charCount(currentText, begin) > charCount(currentText, end)) {
            quickItemList.push({
                "label": end,
                "description": desc
            })
        }
    }
    let moveForEnd = (item: vscode.QuickPickItem) => {
        let end = item.label;
        for (let i = position.character; i < line.range.end.character; i++) {
            let currentCh = line.text.charAt(i)
            if (currentCh === end) {
                let newPosition = new vscode.Position(position.line,
                    i + 1)
                textEditor.selection = new vscode.Selection(newPosition,
                    newPosition);
                break;
            }
        }
    }
    if (quickItemList.length == 0) {
        return;
    }
    if (quickItemList.length === 1) {
        moveForEnd(quickItemList[0]);
        return
    }
    vscode.window.showQuickPick(quickItemList).then((item) => {
        if (item) {
            moveForEnd(item);
            // let activeEditor = vscode.window.activeTextEditor;
            // let insertedText = getInsertedContent(item.description);
            // activeEditor.insertSnippet(new vscode.SnippetString(insertedText), currentPosition)
        }
    })

}