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
        assert.ok(new GithubClient());
    });

    test("getFullRepositoryName", () => {
        assert.equal(
            GithubClient.getFullRepositoryName("https://github.com/kyoshidajp/vscode-tosa.git"),
            "kyoshidajp/vscode-tosa");
        assert.equal(
            GithubClient.getFullRepositoryName("https://github.com/kyoshidajp/vscode-tosa.gitxxx"),
            "kyoshidajp/vscode-tosa");
        assert.equal(
            GithubClient.getFullRepositoryName("git@github.com:kyoshidajp/vscode-tosa.git"),
            "kyoshidajp/vscode-tosa");
        assert.equal(
            GithubClient.getFullRepositoryName("git@github.com:kyoshidajp/vscode-tosa.gitaaa"),
            "kyoshidajp/vscode-tosa");
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

        assert.equal(
            await client.getPullRequestUrl("bc50acff3209ce4eec8b79316b0df70a32042d11", "kyoshidajp/vscode-tosa"),
            "https://github.com/kyoshidajp/vscode-tosa/pull/1",
        );
        assert.equal(
            await client.getPullRequestUrl("bc50acf", "kyoshidajp/vscode-tosa"),
            "https://github.com/kyoshidajp/vscode-tosa/pull/1",
        );
    });
});