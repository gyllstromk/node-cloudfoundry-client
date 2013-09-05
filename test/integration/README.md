# Integration tests

1. Create config file called `config.json`. See `config-example.json` for reference.
2. Run tests via `npm run-script integration-tests`
3. In the case of errors, you can clean everything via `cf delete-org <orgname> --recursive`, where `orgname` is the organization name you indicated in the config file.
