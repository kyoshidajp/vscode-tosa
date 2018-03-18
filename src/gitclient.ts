import { workspace } from 'vscode';
import child_process = require('child_process');

import { GIT_COMMAND, SHA_NOT_COMMIT, CONFIG_NAME } from './constants';
import { GithubClient } from './githubclient';

export class GitClient {
    
    private fileName: string;
    private currentLine: number;
    private currentDirectory: string;

    constructor(fileName: string, currentLine: number, currentDirectory: string) {
        this.fileName = fileName;
        this.currentLine = currentLine;
        this.currentDirectory = currentDirectory;
    }

    public async getRepositoryName() {
        const args = "config --get remote.origin.url".split(" ");
        const gitExecOptions = {
            cwd: this.currentDirectory
        };
        
        return new Promise((resolve, reject) => {
            child_process.execFile(this.gitCommand, args, gitExecOptions, (error, stdout, stderror) => {
                if (error !== null) {
                    reject(stderror.toString() || error.message);
                    return;
                }

                try {
                    resolve(GithubClient.getFullRepositoryName(stdout));
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    public async getCommitHash() {
        const args = `blame -L ${this.currentLine},${this.currentLine} ${this.fileName}`.split(" ");
        const gitExecOptions = {
            cwd: this.currentDirectory
        };

        return new Promise((resolve, reject) => {
            child_process.execFile(this.gitCommand, args, gitExecOptions, (error, stdout, stderror) => {
                if (error !== null) {
                    reject(stderror.toString() || error.message);
                    return;
                }

                let sha = stdout.split(" ")[0];
                if (sha === "") {
                    reject(`Invalid sha. Sha: ${sha}`);
                    return;
                }

                if (sha === SHA_NOT_COMMIT) {
                    reject("This line is not committed yet.");
                    return;
                }

                resolve(sha);
            });
        });
    }

    private get gitCommand(): string {
        const configPath = <string>workspace.getConfiguration(CONFIG_NAME).get('git');
        return configPath === "" ? GIT_COMMAND : configPath;
    }
}