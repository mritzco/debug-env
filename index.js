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

    /**
     * Add separate methods for each library
     */
  const bootstrap = {};

  let logger = {
      debug: require('debug'),
      silent: silent
  };
  // Use debug-levels to log the messages itself
  let ownDebug;

  //
  // Options from command. Can be overriden by using .force(opts)
  //
  let options = {
    loggers: {
      production: 'pino',
      development: 'debug',
      test: 'silent'
    },
    level: process.env.DEBUG_LEVEL || 'info',
    env: process.env.NODE_ENV || 'development',
    namespaces: process.env.DEBUG ||  process.env.NS ||'', // Names defined in environment
    names: {
      enabled: [],
      disabled: []
    }
  };


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


  // Original method from debug-levels
  bootstrap.debug = function(namespace) {
    let obj = emptyFunction;
    if (options.level_index > 2) {
      obj = function() {
        return logger.debug(namespace).apply(null, arguments);
      };
    }

    let thelogger = logger.debug(namespace);
    for (let i in logLevels) {
      let logLevel = logLevels[i];
      obj[logLevel] = i <= options.level_index ?  thelogger: emptyFunction;

    }

    return obj;
  };
  // Bootstrap pino adding
  bootstrap.pino = function(namespace, opts = {}) {
    if (namespaces.isEnabled(namespace, options.names)) {
      //  Pass Pino options
      opts = { ...opts, ...{ ns: namespace } };
      let instance = logger.pino().child(opts);
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
  bootstrap.silent = function() {
      return silent;
  }

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
    // if (active !== options.active) {
        options.active = active;
        // logger = null;
    // }

    //
    // Parse ENV namespaces for pino
    //
    if (options.active === 'pino') {
      namespaces.parse(options.names);
    }

    // Add support for debug in the same library
    ownDebug = bootstrap[options.active]('debug-env');

  }

  init(envDebugger);

  /**
   * Create Debug-level supported debug
   *
   */
  module.exports = function factory(namespace, opts) {

    if (!logger.hasOwnProperty(options.active)) {
      logger[options.active] = require(options.active);
    }

    ownDebug.trace("[debug-env] create", {namespace, env: options.env, level: options.level, debugger: options.active});

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
    options.names.env = options.namespaces
    init();
  };
})();
