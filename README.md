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

Interaction is accomplished via `client.<endpoint>.<method>`. (see examples below)

# Usage

## Creating client

Authentication can be done via either token or login. If, however, the token
expires, the login info will be used to acquire a new token. Hence, long
running processes should consider the use of email/password.

```js
var Client = require('cloudfoundry-client');

var client = new Client({
    host:  'pivotal.io',
    protocol: 'https:',
    token: 'XYZ',        // optional if email/password is provided
    email: 'my email'    // optional if token is provided
    password: 'password' // optional if token is provided
});
```

## Getting from collections

Paging is accomplished automatically. For example, a request for `apps` will
return all apps, not just those returned on the first page.

For example, to get all apps:

```js
client.apps.get(function (err, apps) {
    console.log('your apps are:', apps);
});
```

To get a single item:

```js
var guid = < app guid >;

client.apps.get(guid, function (err, app) {
    console.log(util.format('app by %s is %s', guid, app));
});
```

Getting nested attributes:

```js
client.apps.get(guid).get('summary', function (err, summary) {
    console.log(util.format('summary for app %s is %s', guid, summary));
});
```

# Roadmap

See issues.
