import * as vscode from "vscode"
import { extname } from "path";




export interface IConfig extends vscode.WorkspaceConfiguration {
    // insert_list: Array<IInsertItem>
    query_name: string,
    comment_name: string
}

export function getConfig(): IConfig {
    let config = vscode.workspace.getConfiguration("python-helper") as IConfig;
    return config
}