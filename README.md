# OpenMined Website

Welcome to the OpenMined website! It's our goal here to accurately and beautifully explain the vision of the OpenMined project to all contributors past, present, and future.

## Design Disclaimer

Generally speaking, design and copy changes (other than bugs and typos) should be done by a UI designer within the OpenMined community. This work should be publicly discussed in Slack before it is implemented. All pull requests of a visual nature that aren't directly related to an existing issue will likely be denied and closed. OpenMined believes that good, intuitive design is at the core of the AI revolution, so we take these values and their implementation very seriously.

## Installation & Development

This is a React application based on the [Create React App](https://github.com/facebookincubator/create-react-app) starter application. For information on Create React App, or to get the project, running on your machine, **please refer to their documentation**.

To run locally with hot reloading, run `yarn start`. To run locally with server-side rendering enabled, run `yarn build` and then `yarn serve` to start the server. Please note that `yarn serve` still uses the locally-hosted version of Wordpress, as does `yarn start`.

## Contributing

Please read the "Design Disclaimer" above first before trying to contribute. We welcome any and all visual issues, bugs, typos, and obvious mistakes to be submitted by pull request. For all other changes, please first open a Github issue on this repository and it will be reviewed by a member of the design and marketing team before development is approved.

## Deployment

Deployment is controlled by OpenMined admins with AWS access. Because this is only a limited number of people, deployment will be done at their discretion. Access to the OpenMined AWS account is limited and will likely permanently remain limited. This runs on AWS. It uses Fargate (ECS), Application ELB, Codepipeline, and Codebuild. The live site is redeployed whenever a change is made to `master`.

The pipeline setup follows [these instructions closely](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-cd-pipeline.html).

The Fargate setup follows [these instructions loosely](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_GetStarted.html).
