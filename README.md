# VS Code TOSA
[![](https://vsmarketplacebadge.apphb.com/version-short/kyoshidajp.vscode-tosa.svg)](https://marketplace.visualstudio.com/items?itemName=kyoshidajp.vscode-tosa)
[![Travis](https://travis-ci.org/kyoshidajp/vscode-tosa.svg?branch=master)](https://travis-ci.org/kyoshidajp/vscode-tosa)

A [Visual Studio Code](https://code.visualstudio.com/) [extension](https://marketplace.visualstudio.com/VSCode) which open pull request page from line you selected. You can more easily find why the code is included by the page.

<img src="https://user-images.githubusercontent.com/3317191/37252237-0752e564-2561-11e8-8028-662393dbb05c.png" width="600px" />

If you want to run not only on VS Code also CLI? You can get CLI version from [here](https://github.com/kyoshidajp/tosa). 

## Extension Settings

You can specify the following settings:

| name | type | description | default |
| :--- | :--- | :---------- | :------ |
| `vscodetosa.token` | string | A Token to access GitHub API v3.<br>If not set, you can't access private repository. | `""` |
| `vscodetosa.openSystemBrowser` | boolean | Open pull request page on a System Web Browser.<br>If set `false`, then open inline HTML view. | `true` |

<img width="500" alt="vscodetosa_settings" src="https://user-images.githubusercontent.com/3317191/37252324-b567b00c-2562-11e8-89af-74ad23ff6864.png">

## Author

[Katsuhiko YOSHIDA](https://github.com/kyoshidajp)
