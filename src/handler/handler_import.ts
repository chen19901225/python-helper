/**
 * 
 * impport 还是保存到project里面去吧,不然的话,太麻烦了
 */
 import * as vscode from "vscode";
 import * as fs from "fs";
 import * as os from "os";
 import { Persist } from "../persist";
 import { get_workspace_path, split_file_content } from "../util";
 
 export function handle_import_add_selected(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
     let workspace_dir = get_workspace_path();
     let document = textEditor.document;
     if(textEditor.selection.isEmpty) {
         vscode.window.showErrorMessage("请选中内容");
         return;
     }
     let selected_text = document.getText(new vscode.Range(textEditor.selection.start, textEditor.selection.end));
     if(selected_text) {
         Persist.saveCmdStr(workspace_dir, selected_text);
         vscode.window.showInformationMessage(`成功保存text:[${selected_text}]`);
     }
 
 }
 
 export function handle_import_insert_import(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
     let end_line = "# __end_import__"
     let workspace_dir = get_workspace_path();
     let current_path = textEditor.document.uri.fsPath;
     let document = textEditor.document;
     if(textEditor.selection.isEmpty) {
         vscode.window.showErrorMessage("请选中内容");
         return;
     }
     let selected_text = document.getText(new vscode.Range(textEditor.selection.start, textEditor.selection.end));
     let content = fs.readFileSync(current_path, 'utf-8')
     let [firstLines,  lastLines] = split_file_content(content, end_line);
     if(lastLines.length == 0) {
         vscode.window.showErrorMessage(`没有找到结束行  [${end_line}]`);
         return;
     }
     for(let line of firstLines) {
         line = line.trim()
         if(line.length >0)  {
             if(line.indexOf(selected_text)>-1) {
                 vscode.window.showErrorMessage(`selected_text已经导出, line: [${line}], selected_text:[${selected_text}]`)
                 return;
             }
         }
     }
     let cmd_list:string[] = Persist.loadFromProj(workspace_dir);
     let ljust = (value_str:string, count: number):string => {
         let prefix = "0".repeat(count)
         let new_str= value_str + prefix
         return new_str.slice(new_str.length-count);
     }
     cmd_list = cmd_list.filter((o) => {
         return o.indexOf(selected_text) > -1
     })
     if(cmd_list.length == 0) {
         vscode.window.showErrorMessage(`没有找到selected_text: [${selected_text}]`);
         return
     }
     let quickItemList: vscode.QuickPickItem[] = []
     let i = 1;
     for (let cmd of cmd_list) {
         quickItemList.push({
             "label": ljust(i+"", 2) + ". " + cmd,
             "description": cmd
         })
         i++;
     }
     vscode.window.showQuickPick(quickItemList).then((item) => {
         if (item) {
             let current_var = item.description!;
             // let activeEditor = vscode.window.activeTextEditor!;
            //  middleLines.push(current_var);
            firstLines.push(current_var)
             let new_content = [firstLines.join(os.EOL), end_line, lastLines.join(os.EOL)].join(os.EOL)
             fs.writeFileSync(current_path, new_content, 'utf-8')
             vscode.window.showInformationMessage(`添加import成功 [${current_var}]`)
         }
     })
 
 
     
 }