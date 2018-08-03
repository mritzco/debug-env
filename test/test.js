

var test = require('../index');
var assert = require('chai').assert;

function fnName(fn){
    let tmp = fn.toString();
    return tmp.substring(9,tmp.indexOf('('));
}

describe('debug-env', function() {
  describe('initial properties exist', function() {
    it('returns a factory function', function() {
      assert.typeOf(test, 'function');
    });
    it('logger not available until create', function() {
      assert.typeOf(test.logger, 'null');
    });
    it('exports force', function() {
      assert.typeOf(test.force, 'function');
      assert.equal('force', fnName(test.force));
    });
  });
  describe('debug', function() {
      let debug = null;
      before(function() {
          var options = {
              loggers: {
                production: 'pino',
                development: 'debug',
                test: 'debug'
            },
            level:'warn',
            env: 'development',
            namespaces:'test.msg'
          }
          test.force(options);
          process.env.DEBUG='test:msg';
          debug = test('test:msg');
      });
      it('internal logger exposed', function() {
        assert.typeOf(test.logger, 'function');
      });
      it('should print all messages from info ',function() {
          // Pending test.. need to capture STDOUT & ERR
          debug.fatal("Starting this fatal");
          debug.error("Starting this error");
          debug.warn("Starting this warn");
          debug("Default behaviour");
          debug.info("Starting this info");
          debug.debug("Starting this debug");
          debug.trace("Starting this trace");
  });
  });
});

// console.log("[result]",test.levels);
// console.log("[result]",test.logger);
// console.log("[result]",test.setloggers);
// assert.equal([1,2,3].indexOf(4), -1);
