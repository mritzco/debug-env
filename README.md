# debug-env
A small wrapper for switching logging libraries depending on environment. You can simply drop in place of [Debug](https://github.com/visionmedia/debug).

## Motivation
I couldn't find a library that will address all my whims:

- [Debug](https://github.com/visionmedia/debug): Easy of use and clarity of output.
- [Debug-levels](https://github.com/tilleps/debug-levels): Use levels of logging on top of namespaces.
- [Pino](https://npm.im/pino): Nice fast logging, replaces morgan, ideal for production.


# Installation
```
 npm install debug-env
 ```

 # Usage
 Example:
```
const debug = require('debug-env')('namespace')
```

## Available levels
Uses the same levels available in [Pino](https://npm.im/pino)
 - fatal
 - error
 - warn
 - info
 - debug
 - trace


```
console.log(require('debug-env').levels);
// Prints
['fatal', 'error', 'warn', 'info', 'debug', 'trace']
```

## Adding logs to your code

Works just like [Debug](https://github.com/visionmedia/debug) so you could just drop in place. Then add levels as needed

```
//
// All the following will come by 'namespace' as usual
// No info on level is added to the message
//

debug("Default behaviour");
debug.fatal("Message fatal");
debug.error("Message error");
debug.warn("Message warn");
debug.info("Message info");
debug.debug("Message debug");
debug.trace("Message trace");
```
## Command line (ENV)
Three arguments are supported
- `DEBUG`: namespace (from [Debug](https://github.com/visionmedia/debug))
- `DEBUG_LEVEL`: (default: info) Log level (from [Pino](https://github.com/pinojs/pino/blob/master/docs/API.md))
- `DEBUGGER`: Overrides debugger to use [pino/debug]

```
DEBUG=app:* DEBUG_LEVEL=debug npm start
```

## Using in production mode
In production mode the logger is changed to [Pino](https://npm.im/pino) you don't need to make any changes in the code.
Namespaces are added to the output as `ns` property.

You can use Pino transports and other external libraries as usual.

Using pm2 to execute and control the log rotation.
[Check pm2 ecosystem](https://pm2.io/doc/en/runtime/guide/ecosystem-file/) file.
```
DEBUG=app:* DEBUG_LEVEL=warn node index
```



### [Debug](https://github.com/visionmedia/debug) & [Pino](https://npm.im/pino) advanced functionality
Both libraries are far more powerful but compatibility would be broken. If you require advance functionality. You can add conditionally or use the library directly.
