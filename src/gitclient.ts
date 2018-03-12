import { window, workspace, commands, StatusBarAlignment, Uri } from 'vscode';
import child_process = require('child_process');
import path = require('path');

import { GIT_PATH, CONFIG_NAME, SHA_NOT_COMMIT } from './constants';

export class GitClient {

    private _statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    private octokit = require('@octokit/rest')();

    constructor() {
        this.initializeOctokit();
    }

    public openPR() {
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        const doc = editor.document;
        if (doc.isDirty) {
            this.showInfo("You must save document before opening Pull Request.");
            return;
        }

        const fileName = path.basename(doc.fileName);
        const currentLine = editor.selection.active.line + 1;
        const blameCommand = GIT_PATH;
        const args = `blame -L ${currentLine},${currentLine} ${fileName}`.split(" ");
        const currentDirectory = path.dirname(doc.fileName);
        const gitExecOptions = {
            cwd: currentDirectory
        };
        child_process.execFile(blameCommand, args, gitExecOptions, (error, stdout, stderror) => {
            if (error !== null) {
                window.showErrorMessage(stderror.toString());
                return;
            }

            this.openPage(stdout);
        });
    }

    public dispose() {
    }

    private initializeOctokit():void {
        const config = workspace.getConfiguration(CONFIG_NAME);
        const token = config['token'];
        if (!token) {
            this.showError(`Could not find ${CONFIG_NAME}.token in settings.`);
            return;
        }

        this.octokit.authenticate({
            type: 'integration',
            token: token
        });
    }

    private showInfo(message: string) {
        window.showInformationMessage(message);
        console.info(message);
    }

    private showError(message: string) {
        window.showErrorMessage(message);
        console.info(message);
    }

    private async openPage(out: string) {
        let sha = out.split(" ")[0];
        if (sha === "") {
            console.error(`Invalid sha. Sha: ${sha}`);
            return;
        }

        if (sha === SHA_NOT_COMMIT) {
            this.showError("This line is not committed yet.");
            return;
        }

        const q = `${sha} type:pr is:merged`;
        this.octokit.search.issues({q, sort: "created", order: "desc"}, (error: any, result: any) => {
            if (error) {
                this.showSerachPRError(error);
                return;
            }

            let items = result.data.items;
            if (items.length === 0) {
                this.showError(`Could not find Pull Request. Sha: ${sha}`);
                return;
            }
    
            let pr = items[items.length - 1];
            let url = pr.pull_request.html_url;
            commands.executeCommand('vscode.open', Uri.parse(url));
        });
    }

    private showSerachPRError(error: any) {
        let message = "Unknown error was occured while searching the Pull Request.";
        if (error.message) {
            message += `\nErrorMessage: ${error.message}`;
        }
        this.showError(message);
    }
}