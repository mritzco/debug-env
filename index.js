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
  const env = process.env.NODE_ENV || 'development',
    logLevel = process.env.DEBUG_LEVEL || 'info',
    defaultDebugger = 'debug',
    logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
    debuggers = {
      production: 'pino',
      development: 'debug',
      test: 'debug'
    };

  /**
   * Includes the debugger if exists otherwise default [debug]
   */
  let debuggerName = debuggers.hasOwnProperty(env) ? debuggers[env] : defaultDebugger;
  const logger = require(debuggerName);

  //
  //  Empty function
  //
  function emptyFunction() {
    return function() {};
  }

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
    let instance = logger().child({ ns: namespace });
    let obj = function() {
      return instance.info.apply(instance, arguments);
    };

    for (let i in logLevels) {
      var logLevel = logLevels[i];
      var allowedLevel = allowedLevels.indexOf(logLevel) > -1;

      obj[logLevel] = allowedLevel ? instance[logLevel].bind(instance) : emptyFunction;
    }

    return obj;
  };

  bootstrap.test = bootstrap.development;
  /**
   * Create Debug-level supported debug
   *
   */
  module.exports = function(namespace) {
    console.log('[debug-env start]', env, namespace);
    return bootstrap[debuggers[env]](namespace);
  };

  //
  //  Export available levels
  //
  module.exports.levels = logLevels;
})();
