import { workspace } from 'vscode';

import { CONFIG_NAME } from './constants';

export class GithubClient {
    private octokit: any;
    private token: string = "";

    constructor() {
        this.initializeOctokit();
    }

    static getFullRepositoryName(url: string) {
        const parsedUrl = url.match(/.+github\.com[\/:](.+)\.git/);
        if (parsedUrl) {
            return parsedUrl[1];
        }

        throw new Error("Could not get repository name.");
    }

    public async getPullRequestUrl(sha: string, repo: string) {
        const q = `${sha} type:pr is:merged repo:${repo}`;
        return new Promise((resolve, reject) => {
            this.octokit.search.issues({ q, repo, sort: "created", order: "desc" }, async (error: any, result: any) => {
                if (error) {
                    if (error.code === 422) {
                        reject("You don't have permission to access. Check your configuration \"vscodetosa.token\" is set and valid or not.");
                    } else {
                        reject("Unknown error was occured while searching the Pull Request.");
                    }
                    return;
                }

                let items = result.data.items;
                if (items.length === 0) {
                    const errorMessage = `Could not find Pull Request. Sha: ${sha}`;
                    // this is not good
                    const parentRepo = await this.getParentRepositoryName(repo).catch((error) => {
                        reject(new Error(errorMessage));
                        return;
                    });
                    resolve(this.getPullRequestUrl(sha, <string>parentRepo));
                    return;
                }

                const pr = items[items.length - 1];
                const url = pr.pull_request.html_url;
                resolve(url);
            });
        });
    }

    private async getParentRepositoryName(fullRepo: string) {
        const [owner, repo] = fullRepo.split("/");
        return new Promise((resolve, reject) => {
            this.octokit.repos.get({ owner, repo }, (error: any, result: any) => {
                if (error || !result.data.parent) {
                    reject(error);
                    return;
                }

                resolve(result.data.parent.full_name);
            });
        });
    }

    private getToken(): string {
        const config = workspace.getConfiguration(CONFIG_NAME);
        this.token = <string>config.get('token');
        return this.token;
    }

    private initializeOctokit(): void {
        this.octokit = require('@octokit/rest')();

        this.getToken();
        if (this.token) {
            this.octokit.authenticate({
                type: 'integration',
                token: this.token
            });
        }
    }
}