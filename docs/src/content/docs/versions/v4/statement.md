---
title: Version 4 statement
sidebar:
  order: 1
  label: Statement
---

In May 2021, we started [an issue / RFC, "What would you like to see in Style Dictionary 4.0?"](https://github.com/style-dictionary/style-dictionary/issues/643) to gather feedback on what the community would like to see.
Fortunately, in August 2023, the folks at [Tokens Studio](https://tokens.studio/) contacted us about co-maintaining this project, and leading the v4 release (and beyond)!

We have started working on the biggest and most important changes, like migrating to ESM, making the library browser-compatible out of the box, and supporting asynchronicity in Style Dictionary's various APIs. There will be multiple prereleases to battle-test these changes before a final v4.0 is released.

You can follow [this roadmap board](https://github.com/orgs/style-dictionary/projects/4/views/1?layout=board) to keep an eye on the developments for v4.0, we will also keep adding to this board when we encounter changes we'd like to see in v4.0 that would entail a breaking change. Absence of something in this roadmap does not mean we don't see value in it, but rather that it could also be added in a (non-breaking) minor release within v4.x.x.

## From the folks at Tokens Studio

Hi everyone! I'm Joren from Tokens Studio, a big fan of this project (see [Style-Dictionary-Play](https://www.style-dictionary-play.dev/), [Token Configurator](https://configurator.tokens.studio/), [sd-transforms](https://github.com/tokens-studio/sd-transforms)) and the main pusher behind leading a 4.0 release of this project, I think it would be good to explain from our perspective why we've made the move to collaborate with Amazon on this.

At Tokens Studio, we're a huge fan of Design Tokens and the workflows they enable. We believe exporting design tokens to various platforms is a key ingredient in ensuring that the journey from design to implementation code is smooth.
In our minds, Style Dictionary has been the most popular and most flexible library for reaching that goal, and so we want to build on top of that.
Rather than starting our own spinoff tool, we much prefer bringing Style Dictionary further, together with its vibrant community of contributors, which is why we reached out to Danny Banks.

I think it's important to stress that it is our shared vision to keep Style Dictionary as an agnostic (so not "Tokens Studio"-specific) and flexible tool. As Tokens Studio, while we are highly incentivized to see this project progress further to strengthen our product journey, we value the open source community highly and want to make sure this library remains the go-to tool for exporting Design Tokens, whether you use Tokens Studio or not.

We are very open to feedback and collaboration, feel free to reach out to us in [our Slack](https://join.slack.com/t/tokens-studio/shared_invite/zt-1p8ea3m6t-C163oJcN9g3~YZTKRgo2hg) -> `style-dictionary-v4` channel!

## List of Changes

The prereleases will contain breaking changes, so it's important to read the list of changes since v3 if you're looking to migrate.

You can find the list of changes in [our changelog on the v4 branch](https://github.com/style-dictionary/style-dictionary/blob/main/CHANGELOG.md)
