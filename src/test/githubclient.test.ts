import * as assert from 'assert';
import nock = require('nock');
import sinon = require('sinon');

import { GithubClient } from '../githubclient';

suite("GithubClient Tests", () => {

    let tokenIndex = 0;
    const stub = sinon.stub(GithubClient.prototype, <any>'getToken');

    test("constructor", () => {
        stub.onCall(tokenIndex++).returns("1231");
        assert.ok(new GithubClient());

        stub.onCall(tokenIndex++).returns("");
        assert.throws(() => {return new GithubClient();}, Error);
    });

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

    test("getPullRequestUrl", async () => {
        nock("https://api.github.com")
            .get(/search\/issues/)
            .twice()
            .reply(200, {
                items: [
                    {
                        pull_request: {
                            html_url: "https://github.com/kyoshidajp/vscode-tosa/pull/2"
                        }
                    },
                    {
                        pull_request: {
                            html_url: "https://github.com/kyoshidajp/vscode-tosa/pull/1"
                        }
                    }
                ]
            });

        stub.onCall(tokenIndex++).returns("1231");
        const client = new GithubClient();
        
        assert.equal("https://github.com/kyoshidajp/vscode-tosa/pull/1",
            await client.getPullRequestUrl("bc50acff3209ce4eec8b79316b0df70a32042d11",
                "kyoshidajp/vscode-tosa"
            ));
        assert.equal("https://github.com/kyoshidajp/vscode-tosa/pull/1",
            await client.getPullRequestUrl("bc50acf",
                "kyoshidajp/vscode-tosa"
            ));
    });
});