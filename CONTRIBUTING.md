# Contributing

<!-- TOC -->

- [GitHub Actions configuration](#github-actions-configuration)
- [Local development](#local-development)
  - [Requirements](#requirements)
  - [Process](#process)
- [Content](#content)
  - [Writing a Content-Related PR](#writing-a-content-related-pr)
- [Contributors](#contributors)

For contribution guidelines that may have archived or are currently being moved over to this repo, please refer to [archive/CONTRIBUTING.md](./archive/CONTRIBUTING.md)

<!-- /TOC -->

## GitHub Actions configuration

If you send pull requests to [FCP-INDI/cpac-docs@`main`](https://github.com/FCP-INDI/cpac-docs/tree/main), GitHub Actions should build and deploy the changes. If you're working on a fork and want a published version on your fork, you need to configure some settings:

### Pages

Make sure your fork has a compiled `gh-pages` branch and set **Branch** to `gh-pages` under your fork's `settings/pages`.

### Deploy key

[Locally generate a new SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key) to use for the [deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#deploy-keys). [FCP-INDI/cpac-docs](https://github.com/FCP-INDI/cpac-docs) uses [a machine user](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#machine-users) for the key owner's identity, but what user you want to use for a fork is up to you. Copy the full text of the public key and paste it into **Key** in "Deploy keys / Add new" under your fork's `settings/keys/new`. Give the key write access and whatever title you'd like. Click "Add key".

### Secrets and variables

Copy the full text of [the private key generated above](#deploy-key) and paste it into **Secret** in "Actions secrets / New secret" under your fork's `settings/secrets/actions/new`. Give the secret the name `DEPLOY_SSH_KEY`.

## Local development

Some of the automation for GitHub Pages and autoversioned documentation requires this repository be called "cpac-docs".

### Requirements

- [node](https://nodejs.org/en/download/releases/) `>=18.0.0`
- [yarn](https://yarnpkg.com/getting-started/releases) `>=1.22.22`
- [pre-commit](https://pre-commit.com) `>=3.5.0`

### Process

1. Clone [`FCP-INDI/cpac-docs`](https://github.com/FCP-INDI/cpac-docs).
2. In your local clone,
    1. [install `pre-commit`](https://pre-commit.com/#install),
        and
    2. run `yarn`.
3. Run `yarn dev` to start a local hot-refreshing development server. By default, the compiled code will be served at `http://localhost:5173`.
4. Target pull requests at [`main`](https://github.com/FCP-INDI/cpac-docs/tree/main). Once they're merged to main, the changes will be reflected in [fcp-indi.github.io/cpac-docs/develop](https://fcp-indi.github.io/cpac-docs/develop). When a commit is tagged, that tag will be built as a frozen version, and if it's the latest [semantic version](https://semver.org), that version will also overwrite [fcp-indi.github.io/cpac-docs/latest](https://fcp-indi.github.io/cpac-docs/latest).

## Content

In upholding our SSOT goal for this iteration of C-PAC Documentation, the majority of content has been stored in topic-specific `.yamls` in `src/assets/content`.  To propose a content-related change to these docs, please submit a pull request targeting a specific `.yaml` file in one of the following folders:

- [Index](./src/assets/content/pages/index)
- [About](./src/assets/content/pages/about)
- [Neuroimaging](./src/assets/content/pages/neuroimaging)
- [Pipelines](./src/assets/content/pages/pipelines)
  - [Nodeblocks](./src/assets/content/pages/pipelines/nodeblock_descriptors)
- [How to Use](./src/assets/content/pages/use)
- [Tutorials](./src/assets/content/pages/tutorials)
- [Projects](./src/assets/content/pages/projects)
- [User Support](./src/assets/content/pages/support)
- [Appendix](./src/assets/content/pages/appendix)

### Writing a Content-Related PR

- To contribute content-specific changes, create a new branch and make edits to the appropriate .yaml file
See [FCP-INDI/cpac-docs#78](https://github.com/FCP-INDI/cpac-docs/pull/78) for an example.

## Contributors

To add a contributor using the [@all-contributors bot](https://allcontributors.org/docs/en/bot/usage), use the following syntax in a comment: "@all-contributors please add `@username` for `contributions`".  See [allcontributors.org](https://allcontributors.org/docs/en/bot/usage) for usage and command specifications.
