import { window, workspace, commands, StatusBarAlignment, Uri } from 'vscode';
import child_process = require('child_process');
import path = require('path');

import { GIT_PATH, CONFIG_NAME, SHA_NOT_COMMIT } from './constants';

export class GitClient {

    private statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    private octokit = require('@octokit/rest')();
    private spinner = require('elegant-spinner')();
    private interval: any;
    private currentDirectory = "";
    private fileName = "";
    private currentLine = -1;

    constructor() {
        this.initializeOctokit();
    }

    public async openPR() {
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

        this.fileName = path.basename(doc.fileName);
        this.currentLine = editor.selection.active.line + 1;
        this.currentDirectory = path.dirname(doc.fileName);
        const repositoryName = await this.getRepositoryName();
        const hash = await this.getCommitHash();
        this.openPage(hash.toString(), repositoryName.toString());
    }

    private async getRepositoryName() {
        const args = "config --get remote.origin.url".split(" ");
        const gitExecOptions = {
            cwd: this.currentDirectory
        };
        
        return new Promise(resolve => {
            child_process.execFile(GIT_PATH, args, gitExecOptions, (error, stdout, stderror) => {
                if (error !== null) {
                    this.showError(stderror.toString() || error.message);
                    return;
                }

                resolve(this._getFullRepositoryName(stdout));
            });
        });
    }

    private _getFullRepositoryName(result: string): string {
        const gitProtocolRepo = result.match(/^git@github\.com:(.+)\.git/);
        if (gitProtocolRepo) {
            return gitProtocolRepo[1];
        }
        
        const httpsProtocolRepo = result.match(/^https:\/\/github\.com\/(.+)\.git/);
        if (httpsProtocolRepo) {
            return httpsProtocolRepo[1];
        }

        const message = "Could not get repository name.";
        this.showError(message);
        throw new Error(message);
    }

    private async getCommitHash() {
        const args = `blame -L ${this.currentLine},${this.currentLine} ${this.fileName}`.split(" ");
        const gitExecOptions = {
            cwd: this.currentDirectory
        };

        return new Promise(resolve => {
            child_process.execFile(GIT_PATH, args, gitExecOptions, (error, stdout, stderror) => {
                if (error !== null) {
                    this.showError(stderror.toString() || error.message);
                    return;
                }

                let sha = stdout.split(" ")[0];
                if (sha === "") {
                    this.showError(`Invalid sha. Sha: ${sha}`);
                    return;
                }

                if (sha === SHA_NOT_COMMIT) {
                    this.showError("This line is not committed yet.");
                    return;
                }

                resolve(sha);
            });
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

    private async openPage(sha: string, repo: string) {
        const q = `${sha} type:pr is:merged repo:${repo}`;
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
            this.statusBarItem.text = `$(clock) Searching ${this.spinner()}`;
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