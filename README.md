# Cloudfoundry NG/v2 client

Supports interaction with Cloudfoundry.

Install:

    npm install cloudfoundry-client

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

### Get a single item

```js
var guid = < app guid >;

client.apps.get(guid, function (err, app) {
    console.log(util.format('app by %s is %s', guid, app));
});
```

### Getting nested attributes:

There are two ways to do this. The first is to get the object, then call the method corresponding to its nested collection:

```js
client.apps.get(guid, function (err, app) {
    // handle err
    app.summary.get(function (err, summary) {
        console.log(util.format('summary for app %s is %s', guid, summary));
    });
});
```

The drawback is that this requires 2 round trips to the server: first to get the app, then to get the summary via the summary endpoint.

This can be bypassed by omitting the callback on the first `get`:

```js
client.apps.get(guid).summary.get(function (err, summary) {
    console.log(util.format('summary for app %s is %s', guid, summary));
});
```

This simply executes the call to the summary endpoint using the app's `guid`. The result from the `apps.get`, however, has no app data: only methods allowing the user to get nested collections.

The nested attributes convert the CF endpoints to camel. For example, `service_instances` is accessed in the client via `serviceInstances`:

```
client.apps.get(guid).serviceInstances.get(function (err, serviceInstances) {
    console.log(util.format('summary for app %s is %s', guid, summary));
});
```

Get logs:

client.apps.get(guid).instances.get(0).logs.get(function (err, logs) {
    // check err ..
    console.log('logs for instance 0 are:', log);
});

# Roadmap

See issues.
