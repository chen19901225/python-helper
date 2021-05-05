
export class FunctionDef {
    name!: string
    args!: Array<string>
    kwargs!: Array<string>
    star_args!: string
    star_kwargs!: string
}

export function parse_function(definition: string): FunctionDef {
    let function_name = parse_function_name(definition);
    let param_list = parse_parse_params(definition);
    let arg_list = parse_args(param_list);
    let kwarg_list = parse_kwargs(param_list);
    let star_args = parse_star_args(param_list);
    let star_kwargs = parse_star_kwargs(param_list);
    return {
        'name': function_name,
        'args': arg_list,
        'kwargs': kwarg_list,
        'star_args': star_args,
        'star_kwargs': star_kwargs
    }
}

export function parse_star_args(param_list: Array<string>): string {
    for (let param of param_list) {
        param = param.trim();
        if (param.startsWith('*') && !param.startsWith('**')) {
            return param.substr(1);
        }
    }
    return ''
}
export function parse_star_kwargs(param_list: Array<string>): string {
    for (let param of param_list) {
        param = param.trim();
        if (param.startsWith('**')) {
            return param.substring(2);
        }
    }
    return ''
}

export function parse_function_name(definition: string) {
    let match = definition.match(/(?:async\s*)?def \s*(\w+)\s*\(/);
    if (!match) {
        return "";
    }
    return match[1];
}
export function parse_parse_params(definition: string) {
    let match = definition.match(/(?:async\s*)?def\s*(\w+)\s*\(([\s\S]*)\)\s*(->\s*[ \w\[\],.]*)?\s*:/);
    if (!match) {
        throw Error(`cannot match ${definition}`);
    }
    let params_str = match[2];
    let params_length = params_str.length;
    let out_list: Array<string> = [];
    let expected_map: { [key: string]: string } = {
        "'": "'",
        '"': '"',
        '{': '}',
        '[': ']',
        '(': ')',

    }
    let handle_position = (current_index: number, current_word: string, expected: string = "") => {
        if (params_length === current_index) {
            if (current_word && current_word.trim().length > 0) {
                out_list.push(current_word.trim());
            }

            return;
        }
        let ch = params_str.charAt(current_index);
        if (expected !== "") {
            if (current_word && current_word[current_word.length - 1] === "\\") {
                handle_position(current_index + 1, current_word + ch, expected);
            } else {
                if (ch === expected) {
                    handle_position(current_index + 1, current_word + ch, "");
                } else {
                    handle_position(current_index + 1, current_word + ch, expected);
                }
            }
        } else {
            //
            if (ch == "#") {
                while (1) {
                    ch = params_str.charAt(current_index);
                    if (ch === null || ch == undefined) {
                        break
                    }
                    if (ch === "\n") {
                        break
                    }
                    current_index++
                }

            }   //忽略掉当前行的剩余内容
            // expected === ""
            if (ch in expected_map) {
                let expected_ch = expected_map[ch];
                handle_position(current_index + 1, current_word + ch, expected_ch);
            } else {
                if (ch == ',') {
                    current_word = current_word.trim();
                    out_list.push(current_word);
                    handle_position(current_index + 1, "", "");
                } else {
                    handle_position(current_index + 1, current_word + ch, expected);
                }
            }

        }

    }
    handle_position(0, "", "");
    return out_list;

}


export function parse_args(params: Array<string>) {
    let arg_list: Array<string> = [];

    for (let i = 0; i < params.length; i++) {
        let currentParam = params[i];
        if (currentParam.startsWith('*')) {
            continue;
        }
        if (currentParam.includes('=')) {
            continue;
        }
        let other: Array<string>;
        [currentParam, ...other] = currentParam.split(':');
        arg_list.push(currentParam.trim());
    }
    return arg_list
}
export function parse_kwargs(params: Array<string>) {
    let arg_list: Array<string> = [];
    let other;
    for (let i = 0; i < params.length; i++) {
        let currentParam = params[i];
        if (currentParam.startsWith('*')) {
            continue;
        }
        if (!currentParam.includes('=')) {
            continue;
        }
        [currentParam, ...other] = currentParam.split('=');
        [currentParam, ...other] = currentParam.split(':');
        arg_list.push(currentParam.trim());

    }
    return arg_list
}

