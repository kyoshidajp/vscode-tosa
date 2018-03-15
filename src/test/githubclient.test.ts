import * as assert from 'assert';
import { GithubClient } from '../githubclient';

suite("GithubClient Tests", () => {

    test("getFullRepositoryName", () => {
        assert.equal("kyoshidajp/vscode-tosa",
            GithubClient.getFullRepositoryName("https://github.com/kyoshidajp/vscode-tosa.git"));
        assert.equal("kyoshidajp/vscode-tosa",
            GithubClient.getFullRepositoryName("https://github.com/kyoshidajp/vscode-tosa.gitxxx"));
        assert.equal("kyoshidajp/vscode-tosa",
            GithubClient.getFullRepositoryName("git@github.com:kyoshidajp/vscode-tosa.git"));
        assert.equal("kyoshidajp/vscode-tosa",
            GithubClient.getFullRepositoryName("git@github.com:kyoshidajp/vscode-tosa.gitaaa"));
    });

    // test("getPullRequestUrl", async () => {
    //     const client = new GithubClient();
    //     assert.equal("https://github.com/kyoshidajp/vscode-tosa/pull/1",
    //         await client.getPullRequestUrl("bc50acff3209ce4eec8b79316b0df70a32042d11",
    //             "kyoshidajp/vscode-tosa"
    //         ));
    //     assert.equal("https://github.com/kyoshidajp/vscode-tosa/pull/1",
    //         await client.getPullRequestUrl("bc50acf",
    //             "kyoshidajp/vscode-tosa"
    //         ));
    // });
});