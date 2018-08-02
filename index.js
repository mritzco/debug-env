/**
 * Debugging switcher depending on environment.
 *
 * - Debug levels are based on pinojs
 * - Adds pino levels to debug library
 * - Adds levels to pino as name
 *
 * All code to add levels to visionmedia/debug copied from debug-levels
 * https://github.com/tilleps/debug-levels
 * - All credits to them
 *
 */
(function() {
  'use strict';
  const namespaces = require('./namespaces'),
    env = process.env.NODE_ENV || 'development',
    logLevel = process.env.DEBUG_LEVEL || 'info',
    forceDebugger = process.env.DEBUGGER || '',
    defaultDebugger = 'debug',
    logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
    debuggers = {
      production: 'pino',
      development: 'pino',
      test: 'debug'
    };
  let names = {
    env: process.env.DEBUG || '',
    enabled: [],
    disabled: []
  };

  /**
   * Includes the debugger if exists otherwise default [debug]
   */
  let debuggerName = debuggers.hasOwnProperty(env) ? debuggers[env] : defaultDebugger;
  /**
   * Allow to set debugger via ENV
   */
  if (forceDebugger) {
    debuggerName = forceDebugger;
  }
  const logger = require(debuggerName);

  //
  //  Empty function
  //
  function emptyFunction() {}

  //
  //  Check supported levels
  //
  var key = logLevels.indexOf(logLevel);

  if (key == -1) {
    //  not in allowed levels
    var msg = '[debug-env] Log level not found in allowed levels';
    throw new Error(msg);
  }

  //
  //  Create a list of allowed levels
  //
  var allowedLevels = logLevels.slice(0, key + 1);

  //
  // Create a blackhole logger
  //
  var blackhole = emptyFunction;
  for (let i in logLevels) {
    blackhole[logLevels[i]] = emptyFunction;
  }

  //
  // Parse ENV namespaces once (All this should be in a init function so debuggers can be changed)
  //
  if (debuggerName === 'pino') {
    namespaces.parse(names);
  }

  /**
   * Add separate methods for each library
   */
  let bootstrap = {};

  // Original method from debug-levels
  bootstrap.debug = function(namespace) {
    let obj = function() {
      return logger(namespace).apply(null, arguments);
    };
    for (let i in logLevels) {
      var logLevel = logLevels[i];
      var allowedLevel = allowedLevels.indexOf(logLevel) > -1;
      obj[logLevel] = allowedLevel ? logger(namespace) : emptyFunction;
    }

    return obj;
  };
  // Bootstrap pino adding
  bootstrap.pino = function(namespace) {
    if (namespaces.isEnabled(namespace, names)) {
      let instance = logger().child({ ns: namespace });
      // If level higher than info, remove all default calls too.
      let obj =
        key > 2
          ? function() {
              return instance.info.apply(instance, arguments);
            }
          : emptyFunction;

      for (let i in logLevels) {
        var logLevel = logLevels[i];
        var allowedLevel = allowedLevels.indexOf(logLevel) > -1;

        obj[logLevel] = allowedLevel ? instance[logLevel].bind(instance) : emptyFunction;
      }

      return obj;
    } else {
      return blackhole;
    }
  };

  bootstrap.test = bootstrap.development;
  /**
   * Create Debug-level supported debug
   *
   */
  module.exports = function(namespace) {
    // console.log('[debug-env start]', env, namespace);
    return bootstrap[debuggerName](namespace);
  };

  //
  //  Export available levels
  //
  module.exports.levels = logLevels;
})();
