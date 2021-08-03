// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { function_apply_self } from './handler/handler_apply_self';
import { cqh_run_pytest_in_terminal } from './handler/handler_cqh_run_pytest_in_terminal';
import { handler_dict_prepend, handler_dict_unpack } from './handler/handler_dict_unpack';
import { export_class_to_module } from './handler/handler_export_class_to_module';
import { file_name } from './handler/handler_file_name';
import { get_current_class_name } from './handler/handler_get_current_class_name';
import { get_last_if_variable } from './handler/handler_get_last_if_variable';
import { get_last_line_variable } from './handler/handler_get_last_line_variable';
import { insert_left_pattern } from './handler/handler_get_left_pattern';
import { get_peewee_model_path } from './handler/handler_get_peewee_model_path';
import { get_var_from_comment_runner } from './handler/handler_get_var_from_comment';
import { get_var_from_model } from './handler/handler_get_var_from_model';
import { get_var_from_query_runner } from './handler/handler_get_var_from_query';
import { handle_var } from './handler/handler_handle_var';
import { insert_base } from './handler/handler_insert_base';
import { insert_last_import } from './handler/handler_insert_last_import';
import { move_op_end } from './handler/handler_move_op_end';
import { node_format } from './handler/handler_node_format';
import { get_parent_args, get_parent_name } from './handler/handler_parent';
import { select_expression } from './handler/handler_select_expression';
import { select_history_cusor } from './handler/handler_select_history_cursor';
import { show_var_list } from './handler/handler_show_var_list';
import { tornado_export_class_to_urls } from './handler/handler_tornado_export_class_to_urls';
import { upgradeDelegate } from './upgrade';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "python-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	//__import_upgrade__

	let disposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.import-upgrade", (textEditor, edit) => {
		if (!(textEditor.selection)) {
			vscode.window.showErrorMessage("You must select a content to convert");
			return;
		}

		// 自动获取鼠标位置
		let editor = vscode.window.activeTextEditor;
		if (editor == undefined) {
			throw Error("activeTextEditor is null");
		}

		const position = editor.selection.active;
		const currentLine = editor.document.lineAt(position.line);


		// var newPosition = position.with(position.line, currentLine.firstNonWhitespaceCharacterIndex);
		let newPosition = new vscode.Position(position.line, currentLine.firstNonWhitespaceCharacterIndex)
		var newSelection = new vscode.Selection(newPosition, new vscode.Position(position.line, currentLine.range.end.character));
		editor.selection = newSelection;

		upgradeDelegate(textEditor, edit);
	})
	context.subscriptions.push(disposable);

	//__import_upgrade_end__

	// __function_apply_self__
	let functionApplySelfDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.function_apply_self",
		(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
			function_apply_self(textEditor, edit);
		})
	context.subscriptions.push(functionApplySelfDisposable);
	// __function_apply_self_end__

	// __get_parent_args_dict__
	let getParentArgsDisposable = vscode.commands.registerTextEditorCommand('cqh-python-import-helper.get_parent_args_dict', (textEditor, edit) => {
		get_parent_args(textEditor, edit);
	})
	context.subscriptions.push(getParentArgsDisposable);
	// __get_parent_args_dict_end__

	// __get_parent_name__
	let getParentNameDisposable = vscode.commands.registerTextEditorCommand('cqh-python-import-helper.get_parent_name', (textEditor, edit) => {
		get_parent_name(textEditor, edit);
	})
	context.subscriptions.push(getParentNameDisposable);
	// __get_parent_name_end__

	//__dict_unpack__
	let DictUpackDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.dict_unpack",
		(textEditor, edit) => {
			handler_dict_unpack(textEditor, edit);
		})
	context.subscriptions.push(DictUpackDisposable);
	//__dict_unpack_end__

	// __dict_prepend__
	let DictGetPrependDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.dict_prepend",
		(textEditor, edit) => {
			handler_dict_prepend(textEditor, edit);
		})
	context.subscriptions.push(DictGetPrependDisposable);

	// __dict_prepend_end__

	//__get_left_pattern__
	let getLeftPatternDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_left_pattern",
		(textEditor, edit) => {
			insert_left_pattern(textEditor, edit);
		});
	context.subscriptions.push(getLeftPatternDisposable);
	//__get_left_pattern_end__

	// __get_last_if_variable__
	let getLastIfVariablePosable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_last_if_variable",
		(textEditor, edit) => {
			get_last_if_variable(textEditor, edit);
		});
	context.subscriptions.push(getLastIfVariablePosable);
	// __get_last_if_variable_end__

	//__get_last_line_variable__
	let getLastLineVariableDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_last_line_variable",
		(textEditor, edit) => {
			get_last_line_variable(textEditor, edit);
		})
	context.subscriptions.push(getLastLineVariableDisposable);
	// __get_last_line_variable_end__

	// __show_var_list__
	let showVarListDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.show_var_list",
		(textEditr, edit) => {
			show_var_list(textEditr, edit);
		});
	context.subscriptions.push(showVarListDisposable);
	// __show_var_list_end__

	//__get_current_filename__
	let getFileNameDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_current_filename",
		(textEdit, edit) => {
			file_name(textEdit, edit);
		})
	context.subscriptions.push(getFileNameDisposable);
	//__get_current_filename_end__

	// get crrent class name
	// __get_current_classname__
	let getCurrentClassNameDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_current_classname",
		(textEdit, edit) => {
			get_current_class_name(textEdit, edit);
		});

	context.subscriptions.push(getCurrentClassNameDisposable);
	// __get_current_classname_end__

	// __move_op_end__
	let moveOpEndDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.move_op_end",
		(textEdit, edit) => {
			move_op_end(textEdit, edit);
		})
	context.subscriptions.push(moveOpEndDisposable);
	// __move_op_end_end__


	// __insert_base__
	let insertBaseDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.insert_base",
		(textEdit, edit) => {
			insert_base(textEdit, edit);
		});

	context.subscriptions.push(insertBaseDisposable);
	// __insert_base_end__

	// __export_class_to_module__
	let exportClassToModuleDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.export_class_to_module",
		(textEdit, edit) => {
			export_class_to_module(textEdit, edit);
		});
	context.subscriptions.push(exportClassToModuleDisposable);
	// __export_class_to_module_end__

	// __tornado_export_class_to_urls__
	let tornadoExportClassToUrlsDiposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.tornado_export_class_to_urls",
		async (textEdit, edit) => {
			await tornado_export_class_to_urls(textEdit, edit);
		});
	context.subscriptions.push(tornadoExportClassToUrlsDiposable);
	// __tornado_export_class_to_urls_end__

	// __node-format__
	let nodeFormatDiposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.node-format",
		(textEdit, edit) => {
			node_format(textEdit, edit);
		})
	context.subscriptions.push(nodeFormatDiposable);
	// __node-format__

	// __handler_var__
	let handlerVarDisposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.handler-var",
		(textEdit, edit) => {
			handle_var(textEdit, edit);
		})

	context.subscriptions.push(handlerVarDisposable);

	//__select-history-cusor__
	let handleSelectHistoryCusorDiposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.select-history-cusor",
		(textEdit, edit) => {
			select_history_cusor(textEdit, edit);
		})
	context.subscriptions.push(handleSelectHistoryCusorDiposable);

	// __insert-last-import__
	let insertLastImportDiposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.insert-last-import",
		(textEdit, edit) => {
			insert_last_import(textEdit, edit);
		});
	context.subscriptions.push(insertLastImportDiposable);


	//__cqh_run_pytest_in_terminal__
	let cqh_run_pytest_in_terminal_disposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.cqh_run_pytest_in_terminal",
		(textEdit, edit) => {
			cqh_run_pytest_in_terminal(textEdit, edit);
		})

	context.subscriptions.push(cqh_run_pytest_in_terminal_disposable);

	//__get_var_from_comment__
	let get_var_from_comment_disposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_var_from_comment", (textEdit, edit) => {
		get_var_from_comment_runner(textEdit, edit);
	})

	context.subscriptions.push(get_var_from_comment_disposable);

	//__get_var_from_query__
	let get_var_from_query_disposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_var_from_query", (textEdit, edit) => {
		get_var_from_query_runner(textEdit, edit);
	})

	context.subscriptions.push(get_var_from_query_disposable);

	//__get_var_from_model__
	let get_var_from_model_disposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_var_from_model", (textEdit, edit) => {

		get_var_from_model(textEdit, edit);
	})
	context.subscriptions.push(get_var_from_model_disposable);

	//__get_peewee_model__
	let get_peewee_model_disposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.get_peewee_model", (textEdit, edit) => {

		get_peewee_model_path(textEdit, edit);
	})
	context.subscriptions.push(get_peewee_model_disposable);

	//__select_expression__
	let select_expression_disposable = vscode.commands.registerTextEditorCommand("cqh-python-import-helper.select_expression", (textEdit, edit) => {
		select_expression(textEdit, edit);
	})
	context.subscriptions.push(select_expression_disposable)

}

// this method is called when your extension is deactivated
export function deactivate() { }
