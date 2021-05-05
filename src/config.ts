import * as vscode from "vscode"
import { extname } from "path";


export interface IInsertItem {
    name: string;
    list: Array<String>;

}


export interface IConfig extends vscode.WorkspaceConfiguration {
    insert_list: Array<IInsertItem>
}

export function getConfig(): IConfig {
    let config = vscode.workspace.getConfiguration("python-import-helper") as IConfig;
    return config
}