# debug-env
A small wrapper for switching logging libraries depending on environment.

Works like a drop in place replacement of [Debug](https://github.com/visionmedia/debug) but uses  [Pino](https://npm.im/pino) in production environment.

- Use just like debug
- Adds levels to [Debug](https://github.com/visionmedia/debug)
- Adds namespaces to [Pino](https://npm.im/pino)
- Swaps between them depending on `NODE_ENV` var
- Adds a silent logger

# Installation
```
 npm install debug-env --save
 ```

 # Usage
 You can use exactly like [Debug](https://github.com/visionmedia/debug). Once you want to separate messages by level just call by method.

 Example:
```
const debug = require('debug-env')('namespace:namespace');
debug("Default behaviour"); // level debug

// Calling it with levels
debug.warn("You want to look at this");

// Check available levels (Same as in Pino)
console.log(require('debug-env').levels);

['fatal', 'error', 'warn', 'info', 'debug', 'trace']
```

## Displaying debug info
Works by reading the following environment variables:
- `DEBUG`: namespace (from [Debug](https://github.com/visionmedia/debug))
- `DEBUG_LEVEL`: (default level: debug)  (from  [Pino](https://github.com/pinojs/pino/blob/master/docs/API.md))
- `DEBUGGER`: Force overrides debugger to use

Example:
```
DEBUG=myapp:* DEBUG_LEVEL=debug npm start
```

## Changing the debugger
You can change using `DEBUGGER` env variable or from code:
```
const myloggers = {
  production: 'pino',
  development: 'debug',
  test: 'silent'
};
// You only need to do this one time
const debug = require('debug-env').setLoggers(myloggers)
```

## Using in production mode
In production mode the logger is changed to [Pino](https://npm.im/pino) you don't need to make any changes in the code.
Namespaces are added to the output as `ns` property. You can use Pino transports and other external libraries as usual.

Using pm2 to execute and control the log rotation.
[Check pm2 ecosystem](https://pm2.io/doc/en/runtime/guide/ecosystem-file/) file.

pm2 ecosystem.conf.js
```
module.exports = {
  apps : [{
    name      : 'myapp',
    script    : 'node index.js',
    env: {
      NODE_ENV: 'development',
      DEBUG:'boot:*',
      DEBUG_LEVEL:'info'
    },
    env_production : {
      NODE_ENV: 'production',
      DEBUG:'myapp:*',
      DEBUG_LEVEL:'info'
    }
  }]
};


```
## Advanced use

It is possible to use libraries specific functionality but it will break compatibility. So you need to do it conditionally.

### Example with debug
Debug actually returns debug, and it's also available under the logger property.

```
// Example from Debug site
const createDebug = require('debug-env');
createDebug.formatters.h = (v) => {
  return v.toString('hex');
}
const debug = createDebug('foo');

// You can also access debug
createDebug.logger
```

###Example with Pino
Pino receives parameters as an object when creating loggers. Pass this object as a second parameter after namespace and it will be directly passed to pino.
```
// Example from pino-noir
var pino = require('pino')({
  serializers: redaction
});

// To do the same with debug-env:
const pinoOptions = {
  serializers: redaction
};
const createDebug = require('debug-env')(namespace, pinoOptions));
```

### [Debug](https://github.com/visionmedia/debug) & [Pino](https://npm.im/pino) advanced functionality
Both libraries are far more powerful but compatibility would be broken. If you require advance functionality. You can add conditionally or use the library directly.
