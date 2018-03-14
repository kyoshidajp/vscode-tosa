import { commands, ExtensionContext } from 'vscode';
import { Tosa } from './tosa';

export function activate(ctx: ExtensionContext) {

    console.log('"vscode-tosa" is now active!');

    const app = new Tosa();
    const openCommand = commands.registerCommand(
        'vscodetosa.openPR',
        app.openPR,
        app
    );
    ctx.subscriptions.push(app, openCommand);
}
