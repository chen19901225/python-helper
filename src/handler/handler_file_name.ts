import * as vscode from "vscode";

export function file_name(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let path = textEditor.document.uri.path;
    let basename = path.split("/").pop()!;
    let name = basename.split(".")[0];
    if (!name.includes("_")) {
        edit.insert(textEditor.selection.active, name);
        return;
    }
    let quickPickItem: vscode.QuickPickItem[] = [];
    let options = [
        ["raw", "raw"],
        ["raw_without_prefix", "raw_without_prefix"],
        ["raw_without_suffix", "raw_without_suffix"], 
        ["class_style", "ClassStyle"],
        ["class_style_without_prefix", "class_style_without_prefix"]
    ]
    let index = 1;
    for (let [label, description] of options) {
        quickPickItem.push({
            label: "" + index + "." + label,
            description: label
        })
        index++;
    }

    vscode.window.showQuickPick(quickPickItem).then(item => {
        if (item) {
            let activeEditor = vscode.window.activeTextEditor!;
            let convert_element = convert_filename(name, item.description!);
            activeEditor.insertSnippet(new vscode.SnippetString(convert_element), textEditor.selection.active)
            // edit.insert(currentPosition, item.description);
        }
    })


}

export function convert_filename(name: string, kind: string): string {
    if (kind === 'raw') {
        return name;
    }
    let elements = name.split("_");
    /// 处理handler__name__ext.py这种情况
    elements = elements.filter((v) => { return v != "" })

    if (kind === 'raw_without_prefix') {
        return elements.slice(1).join('_');
    }
    if(kind === "raw_without_suffix") {
        return elements.slice(0, elements.length-1).join("_");
    }
    if (kind === 'class_style') {
        elements = elements.map((value) => {
            return value[0].toUpperCase() + value.substring(1)
        })
        return elements.join("");
    }
    if (kind === 'class_style_without_prefix') {
        elements = elements.slice(1).map((value) => {
            return value[0].toUpperCase() + value.substring(1)
        })
        return elements.join("");
    }
    throw Error("kind error ")
}