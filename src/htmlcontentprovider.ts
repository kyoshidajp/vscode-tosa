import { TextDocumentContentProvider, Uri } from 'vscode';
import request = require('request');

export class HTMLContentProvider implements TextDocumentContentProvider {
    public async provideTextDocumentContent(url: Uri): Promise<string> {
        const body = await this.fetchBody(url.toString());
        return body.toString();
    }

    private async fetchBody(url: string) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                resolve(body);
            });
        });
    }
}