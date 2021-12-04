import * as path from "path";
import * as fs from "fs-extra";

export class Persist {

    public constructor() {

    }

    public static historyPath(dir: string): string {
        return path.join(dir, ".vscode/cqh_python_import.json")

    }

    public static saveCmdStr(dir: string, cmdStr: string) {
        let oldCmdList = Persist.loadFromFile(Persist.historyPath(dir));
        oldCmdList.unshift(cmdStr.trim())
        let new_cmd_list: string[] = []
        let cmd_exists = (cmd:string): Boolean => {
            for(let new_cmd of new_cmd_list) {
                if(new_cmd === cmd) {
                    return true;
                }
            }
            return false;
        }
        for (let cmd_str of oldCmdList) {
            cmd_str = cmd_str.trim();
            if(!cmd_exists(cmd_str)) {
                new_cmd_list.push(cmd_str)
            }
        }
        fs.writeJsonSync(Persist.historyPath(dir), new_cmd_list, {spaces: 2});

    }
    public static loadFromFile(file_path: string): Array<string> {
        try {
            return fs.readJsonSync(file_path);
        } catch (error) {
            fs.ensureFileSync(file_path);
            return [];
        }
    }
    public static loadFromProj(proj_dir:string): Array<string> {
        return Persist.loadFromFile(Persist.historyPath(proj_dir));
    }

}