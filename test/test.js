var test = require('../index');
var assert = require('chai').assert;

function fnName(fn) {
  let tmp = fn.toString();
  return tmp.substring(9, tmp.indexOf('('));
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
  describe('debug levels', function() {
    // describe('pino levels', function() {
    let debug = null;
    before(function() {
      var options = {
        loggers: {
          production: 'pino',
          development: 'debug',
          test: 'debug'
        },
        level: 'warn',
        env: 'development',
        namespaces: 'test:msg'
      };
      test.force(options);
      process.env.DEBUG = 'test:msg';
      debug = test('test:msg');
    });
    it('returns debug', function() {
      assert.equal(fnName(test.logger), 'createDebug');
    });
    it('internal logger exposed', function() {
      assert.typeOf(test.logger, 'function');
    });
    it('All levels exists', function() {
      ['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach(function(item) {
        assert.typeOf(debug[item], 'function');
      });
    });
    it('Levels are set correctyle ', function() {
      var res = ['debug', 'debug', 'debug', 'emptyFunction', 'emptyFunction', 'emptyFunction'];
      ['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach(function(item, i) {
        assert.equal(fnName(debug[item]), res[i]);
      });
    });
  });
  describe('Namespaces', function() {
    let namespaces = require('../namespaces');
    let names = {
      enabled: [],
      disabled: []
    };

    let nsTest = [
      { ns: 'a', expected: true },
      { ns: '123', expected: true },
      { ns: 'a:a', expected: true },
      { ns: 'a:not', expected: false },
      { ns: 'b:a', expected: true },
      { ns: 'b:b', expected: false }
    ];
    let logNS = 'a:*,-a:not,b:a,123:*';

    // it('returns pino', function() {
    //   assert.equal(fnName(test.logger), 'pino');
    // });
    before(function() {
      names.env = logNS;
      namespaces.parse(names);
    });
    it('parsed namespaces', function() {
      let expected = {
        enabled: ['a:*', 'b:a','123:*'],
        disabled: ['a:not'],
        env: 'a:*,-a:not,b:a,123:*'
      };
      assert.deepEqual(names, expected);
    });

    nsTest.forEach(function(item, i) {
      it(` NS: ${item.ns} is resolved correctly`, function() {
        assert.equal(namespaces.isEnabled(item.ns, names), item.expected);
      });
    });
  });
});
