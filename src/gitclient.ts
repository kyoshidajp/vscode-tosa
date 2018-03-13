import { window, workspace, commands, StatusBarAlignment, Uri } from 'vscode';
import child_process = require('child_process');
import path = require('path');

import { GIT_PATH, CONFIG_NAME, SHA_NOT_COMMIT } from './constants';

export class GitClient {

    private statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    private octokit = require('@octokit/rest')();
    private spinner = require('elegant-spinner')();
    private interval: any;

    constructor() {
        this.initializeOctokit();
    }

    public openPR() {
        let editor = window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }

        const doc = editor.document;
        if (doc.isDirty) {
            this.showError("You must save document before opening Pull Request.");
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
                this.showError(stderror.toString() || error.message);
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

    private showError(message: string) {
        window.showErrorMessage(message);
        console.error(message);
    }

    private async openPage(out: string) {
        let sha = out.split(" ")[0];
        if (sha === "") {
            this.showError(`Invalid sha. Sha: ${sha}`);
            return;
        }

        if (sha === SHA_NOT_COMMIT) {
            this.showError("This line is not committed yet.");
            return;
        }

        const q = `${sha} type:pr is:merged`;
        this.octokit.search.issues({q, sort: "created", order: "desc"}, (error: any, result: any) => {
            this.clearSendProgressStatusText();

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
        this.setSendingProgressStatusText();
    }

    private setSendingProgressStatusText() {
        this.clearSendProgressStatusText();
        this.interval = setInterval(() => {
            this.statusBarItem.text = `Searching ${this.spinner()}`;
        }, 50);
        this.statusBarItem.tooltip = 'Waiting Response';
        this.statusBarItem.show();
    }

    private clearSendProgressStatusText() {
        clearInterval(this.interval);
        this.statusBarItem.text = "";
    }

    private showSerachPRError(error: any) {
        let message = "Unknown error was occured while searching the Pull Request.";
        if (error.message) {
            message += `\nErrorMessage: ${error.message}`;
        }
        this.showError(message);
    }
}