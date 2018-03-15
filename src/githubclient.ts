import { workspace } from 'vscode';

import { CONFIG_NAME } from './constants';

export class GithubClient {
    private octokit: any;

    constructor() {
        this.initializeOctokit();
    }

    static getFullRepositoryName(path: string) {
        const gitProtocolRepo = path.match(/^git@github\.com:(.+)\.git/);
        if (gitProtocolRepo) {
            return gitProtocolRepo[1];
        }
        
        const httpsProtocolRepo = path.match(/^https:\/\/github\.com\/(.+)\.git/);
        if (httpsProtocolRepo) {
            return httpsProtocolRepo[1];
        }
        
        throw new Error("Could not get repository name.");
    }

    public async getPullRequestUrl(sha: string, repo: string) {
        const q = `${sha} type:pr is:merged repo:${repo}`;
        return new Promise((resolve, reject) => {
            this.octokit.search.issues({ q, sort: "created", order: "desc" }, (error: any, result: any) => {
                if (error) {
                    reject("Unknown error was occured while searching the Pull Request.");
                    return;
                }

                let items = result.data.items;
                if (items.length === 0) {
                    reject(`Could not find Pull Request. Sha: ${sha}`);
                    return;
                }

                const pr = items[items.length - 1];
                const url = pr.pull_request.html_url;
                resolve(url);
            });
        });
    }

    private initializeOctokit():void {
        this.octokit = require('@octokit/rest')();

        const config = workspace.getConfiguration(CONFIG_NAME);
        const token = config['token'];
        if (!token) {
            throw new Error(`Could not find ${CONFIG_NAME}.token in settings.`);
        }

        this.octokit.authenticate({
            type: 'integration',
            token: token
        });
    }
}