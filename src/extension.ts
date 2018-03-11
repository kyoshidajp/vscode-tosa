import { commands, ExtensionContext } from 'vscode';
import { GitClient } from './gitclient';

export function activate(ctx: ExtensionContext) {

    console.log('"vscode-tosa" is now active!');

    let client = new GitClient();
    const blameCommand = commands.registerCommand(
        'vscodetosa.openPR',
        client.openPR,
        client
    );
    ctx.subscriptions.push(client, blameCommand);
}
