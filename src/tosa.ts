import { window, workspace, commands, StatusBarAlignment, Uri, ViewColumn } from 'vscode';
import path = require('path');

import { GitClient } from './gitclient';
import { GithubClient } from './githubclient';
import { HTMLContentProvider } from './htmlcontentprovider';
import { CONFIG_NAME } from './constants';

export class Tosa {

    private statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    private spinner = require('elegant-spinner')();
    private interval: any;

    public async exec() {
        this.setSendingProgressStatusText();
        const url = <string> await this.getPullRequestUrl();
        this.openPR(url);
        this.clearSendProgressStatusText();
    }

    public dispose() {
    }

    private async getPullRequestUrl(): Promise<string> {
        const editor = window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            throw new Error();
        }

        const doc = editor.document;
        if (doc.isDirty) {
            this.showError("You must save document before opening Pull Request.");
            throw new Error();
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

        const githubclient = new GithubClient();
        return <string> await githubclient.getPullRequestUrl(hash.toString(), repositoryName.toString()).catch(error => {
            this.showError(error);
            throw new Error();
        });
    }

    private openPR(url: string) {
        const htmlUrl = Uri.parse(url);
        const isOpenBrowser = <boolean>workspace.getConfiguration(CONFIG_NAME).get('openSystemBrowser');
        if (isOpenBrowser) {
            commands.executeCommand('vscode.open', htmlUrl);
        } else {
            workspace.registerTextDocumentContentProvider('https', new HTMLContentProvider());
            commands.executeCommand('vscode.previewHtml', htmlUrl, ViewColumn.Two, 'Github');
        }
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