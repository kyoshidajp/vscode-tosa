# VS Code TOSA
[![](https://vsmarketplacebadge.apphb.com/version-short/kyoshidajp.vscode-tosa.svg)](https://marketplace.visualstudio.com/items?itemName=kyoshidajp.vscode-tosa)
[![Travis](https://travis-ci.org/kyoshidajp/vscode-tosa.svg?branch=master)](https://travis-ci.org/kyoshidajp/vscode-tosa)

A [Visual Studio Code](https://code.visualstudio.com/) [extension](https://marketplace.visualstudio.com/VSCode) which opens pull request page from line you selected. You can more easily find why the code is included by the page.

![vscodetosa](https://user-images.githubusercontent.com/3317191/37556973-ef60fe02-2a40-11e8-9898-8f333921702b.gif)

If you want to run not only on VS Code also CLI? You can get CLI version from [here](https://github.com/kyoshidajp/tosa). 

## Settings Options

This extension contributes the following variables to the [settings](https://code.visualstudio.com/docs/getstarted/settings):

| name | type | description | default |
| :--- | :--- | :---------- | :------ |
| `vscodetosa.token` | string | A Token to access GitHub API v3.<br>If set `""`, you can't access private repository. | `""` |
| `vscodetosa.openSystemBrowser` | boolean | Open pull request page on a System Web Browser.<br>If set `false`, then open inline HTML view. | `true` |
| `vscodetosa.git` | string | A path of git command.<br>If set `""`, then used `git` in `PATH`. | `""` |
| `vscodetosa.browser` | string | A command of web browser which opens the pull request when `vscodetosa.openSystemBrowser` is `true`.<br>If set `""`, then uses a System Web Browser.<br>An example to open by Safari on macOS.<br>`open -a Safari` | `""` |

<img width="500" alt="vscodetosa_settings" src="https://user-images.githubusercontent.com/3317191/37252324-b567b00c-2562-11e8-89af-74ad23ff6864.png">

## Author

[Katsuhiko YOSHIDA](https://github.com/kyoshidajp)
