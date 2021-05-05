import * as vscode from "vscode";
import * as path from "path";
import { WorkspaceFolder } from "vscode";
export function cqh_run_pytest_in_terminal(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {

    /**
     * 1. 获取relative path
     * 2. terminal 运行
     */
    let document = textEditor.document;
    let uri = document.uri;
    let fspath = uri.fsPath;

    const workspaceFolders: ReadonlyArray<WorkspaceFolder> | undefined = vscode.workspace.workspaceFolders;
    let rootPath = ""
    if (workspaceFolders) {
        rootPath = workspaceFolders[0].uri.fsPath;
    }
    // const rootPath: string = workspaceFolders?.[0]?.uri.fsPath ?? "";
    // const currentWorkspace: string = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath ?? "";
    let relative_path = path.relative(rootPath, fspath);

    let terminal = vscode.window.activeTerminal!;
    let command = `pytest -v  -x ${relative_path}`;
    terminal.show()
    terminal.sendText(command);
}