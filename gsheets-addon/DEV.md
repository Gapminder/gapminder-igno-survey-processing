# Developer documentation

## Commands

`npm test` - Format, lint and run tests.
`npx clasp login` - Authenticate clasp to be able to deploy the scripts. (Necessary before deploying)
`npm run deploy` - Format, build and deploy to [gs_combined DEV](https://docs.google.com/spreadsheets/d/1eafCGVMj2lUx-Q_FnrbttnZYUgRXcbVoudTRsqGHNY8/edit#gid=0).
`npm run push:prod` - Deploy to [gs_combined](https://docs.google.com/spreadsheets/d/1tV3DZcbyhLYL2vKD9yCnSmFaqdw_LwTlcr5AFdKl3ds/edit?folder=1RmT1moi73Gk1QEzcgU1l1TrvmtxCoYmK#gid=853036938). To be run once the above command completes successfully and manual testing has confirmed that things are working as expected.
