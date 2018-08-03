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
  // Include libraries and constants
  const namespaces = require('./namespaces'),
    envDebugger = process.env.DEBUGGER || '',
    logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

  //
  // Properties that can be overriden
  //
  let logger = null;

  let options = {
    loggers: {
      production: 'debug',
      development: 'debug',
      test: 'debug'
    },
    level: process.env.DEBUG_LEVEL || 'info',
    env: process.env.NODE_ENV || 'development',
    namespaces: process.env.DEBUG || '', // Names defined in environment
    names: {
      enabled: [],
      disabled: []
    }
  };

  function init(forceEnv = false) {
    options.names.env = options.namespaces;
    options.level_index = logLevels.indexOf(options.level);

    // Verify environment and min level exists
    if (options.level_index == -1) {
      throw new Error('[debug-env] Log level not found in allowed levels');
    }

    if (Object.keys(options.loggers).indexOf(options.env) === -1) {
      throw new Error('[debug-env] Unknown environment ');
    }

    let active = forceEnv ? forceEnv : options.loggers[options.env];
    if (active !== options.active) {
        options.active = active;
        logger = null;
    }
    //
    // Parse ENV namespaces for pino
    //
    if (options.active === 'pino') {
      namespaces.parse(options.namespaces);
    }
  }

  init(envDebugger);

  //
  //  Empty function
  //
  function emptyFunction() {}
  //
  // Create a silent logger
  //
  var silent = emptyFunction;
  for (let i in logLevels) {
    silent[logLevels[i]] = emptyFunction;
  }

  /**
   * Add separate methods for each library
   */
  let bootstrap = {};
  // Original method from debug-levels
  bootstrap.debug = function(namespace) {
    let obj = emptyFunction;
    if (options.level_index > 2) {
      obj = function() {
        return logger(namespace).apply(null, arguments);
      };
    }

    for (let i in logLevels) {
      let logLevel = logLevels[i];
      obj[logLevel] = i <= options.level_index ? logger(namespace) : emptyFunction;
    }

    return obj;
  };
  // Bootstrap pino adding
  bootstrap.pino = function(namespace, opts = {}) {
    if (namespaces.isEnabled(namespace, options.names)) {
      //  Pass Pino options
      opts = { ...opts, ...{ ns: namespace } };
      let instance = logger().child(opts);
      // If level higher than info, remove all default calls too.
      let obj = emptyFunction;
      if (options.level_index > 2) {
        obj = function() {
          return instance.debug.apply(instance, arguments);
        };
      }

      for (let i in logLevels) {
        let logLevel = logLevels[i];
        obj[logLevel] = i <= options.level_index ? instance[logLevel].bind(instance) : emptyFunction;
      }
      return obj;
    } else {
      return silent;
    }
  };

  // bootstrap.test = bootstrap.development;
  /**
   * Create Debug-level supported debug
   *
   */
  module.exports = function(namespace, opts) {
    if (!logger) {
      logger = require(options.active);
      module.exports.logger = logger;
    }
    return bootstrap[options.active](namespace, opts);
  };

  //
  //  Export available levels
  //
  module.exports.levels = logLevels;
  // Export underlying library
  module.exports.logger = logger;
  // Allow custom overriding with code
  module.exports.force = function force(opts) {
    options = { ...options, ...opts };
    init();
  };
})();
