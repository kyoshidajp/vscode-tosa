import { window, commands, StatusBarAlignment, Uri } from 'vscode';
import path = require('path');

import { GitClient } from './gitclient';
import { GithubClient } from './githubclient';

export class Tosa {

    private statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    private spinner = require('elegant-spinner')();
    private interval: any;

    public async openPR() {
        const editor = window.activeTextEditor;
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
        const currentDirectory = path.dirname(doc.fileName);
        const gitclient = new GitClient(fileName, currentLine, currentDirectory);

        const repositoryName = await gitclient.getRepositoryName().catch((error) => {
            this.showError(error);
            throw new Error();
        });
        const hash = await gitclient.getCommitHash().catch(error => {
            this.showError(error);
            throw new Error();
        });

        this.setSendingProgressStatusText();
        const githubclient = new GithubClient();
        const url = await githubclient.getPullRequestUrl(hash.toString(),repositoryName.toString()).catch(error => {
            this.showError(error);
            throw new Error();
        });
        this.clearSendProgressStatusText();

        commands.executeCommand('vscode.open', Uri.parse(url.toString()));
    }

    public dispose() {
    }

    private showError(message: string) {
        window.showErrorMessage(message);
        this.clearSendProgressStatusText();
        console.error(message);
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
}