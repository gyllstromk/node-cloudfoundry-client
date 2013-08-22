# Cloudfoundry NG/v2 client

Supports interaction with Cloudfoundry.

Currently *alpha* but actively developed.

Current endpoint support includes:

* apps
* services
* service_plans
* service_instances
* organizations
* spaces
* domains
* runtimes
* frameworks
* events

Interaction is accomplished via `client.<endpoint>.<method>`.

For example, to get all apps:

```js
var Client = require('cloudfoundry-client');

var client = new Client({
    host: 'pivotal.io',
    token: 'bearer XYZ'
});

client.apps.get(function (err, apps) {
    console.log('your apps are:', apps);
});
```

# Roadmap

See issues.
