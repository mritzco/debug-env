let test = require('../index'),
  chai = require('chai');
(assert = chai.assert), (sinon = require('sinon')), (sinonChai = require('sinon-chai'));

chai.use(sinonChai);

function fnName(fn) {
  let tmp = fn.toString();
  return tmp.substring(9, tmp.indexOf('('));
}

describe('debug-env', function() {
  describe('initial properties exist', function() {
    it('returns a factory function', function() {
      assert.typeOf(test, 'function');
    });

    it('exports force', function() {
      assert.typeOf(test.force, 'function');
      assert.equal('force', fnName(test.force));
    });
  });
  describe('debug levels', function() {
    let debug = null;
    let levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
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
      process.env.DEBUG = 'test:msg';
      test.force(options);
      debug = test('test:msg');
    });

    it('returns a factory', function() {
      assert.equal(fnName(test), 'factory');
    });
    it('internal loggers exposed', function() {
      assert.isObject(test.logger);
      assert.hasAllKeys(test.logger, ['debug', 'silent', 'pino']);
      // pino is loaded only on request
    });
    it('returns available levels', function() {
      assert.deepEqual(levels, test.levels);
    });
    it('returns force function', function() {
      assert.isFunction(test.force);
    });
    it('All levels exists', function() {
      levels.forEach(function(item) {
        assert.isFunction(debug[item]);
      });
    });
    it('Levels are set correctyle ', function() {
      var res = ['debug', 'debug', 'debug', 'emptyFunction', 'emptyFunction', 'emptyFunction'];
      levels.forEach(function(item, i) {
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
        enabled: ['a:*', 'b:a', '123:*'],
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
  describe('advanced debug', function() {
    let activeLog;
    before(function() {
      test = require('../index');
      test.logger.debug.formatters.h = v => {
        return v.toString('hex');
      };
      activeLog = test('test:msg');
      var spy = sinon.spy(test.logger.debug, 'log');
    });
    it('allow formatters', function() {
      activeLog.warn('Ignore this hex: %h', new Buffer('hello world'));
      assert.include(test.logger.debug.log.getCall(0).args[0], '68656c6c6f20776f726c64');
    });
    after(function() {
      test.logger.debug.log.restore();
    });
  });

  describe('pino', function() {
    // describe('pino levels', function() {
    let debug = null;
    let levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
    before(function() {
      var options = {
        loggers: {
          development: 'pino'
        },
        level: 'warn',
        env: 'development',
        namespaces: 'debug-env:*,test:msg'
      };
      process.env.DEBUG = 'test:msg';
      test.force(options);
      debug = test('test:msg');
    });

    it('returns a factory', function() {
      assert.equal(fnName(test), 'factory');
    });
    it('internal loggers exposed', function() {
      assert.isObject(test.logger);
      assert.hasAllKeys(test.logger, ['debug', 'silent', 'pino']);
      // pino is loaded only on request
    });
    it('returns available levels', function() {
      assert.deepEqual(levels, test.levels);
    });
    it('returns force function', function() {
      assert.isFunction(test.force);
    });
    it('All levels exists', function() {
      levels.forEach(function(item) {
        assert.isFunction(debug[item]);
      });
    });

    it('default level exists', function() {
      console.log('[debugxx]', debug);
    });
  });

  let levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

  levels.forEach(function(loopLevel, idx) {
    let options = {
      loggers: {
        development: 'pino'
      },
      level: '',
      env: 'development',
      namespaces: 'debug-env:*,test:msg'
    };
    describe('pino correct level at ' + loopLevel, function() {
      let debug = null;
      before(function() {
        process.env.DEBUG = options.namespaces;
        options.level = loopLevel;
        test.force(options);
        debug = test('test:msg');
      });

      it('default logger is correctly set', function() {
        let expected = idx < levels.indexOf('debug') ? 'emptyFunction' : '';
        assert.isFunction(debug);
        assert.equal(fnName(debug), expected);
        // pino is loaded only on request
      });
      it('Levels are set correctyle ', function() {
        // console.log("[LEVEL]",idx, loopLevel);
        levels.forEach(function(item, i) {
          let expected = idx < i ? 'emptyFunction' : '';
          // console.log(" [-] loop: %s(%s) vs innerloop: %s(%s)  ~ %s", loopLevel, idx,item, i, expected);
          // console.log("[debug.item]",debug[item].toString().substring(0,100));
          assert.equal(fnName(debug[item]), expected);
        });
      });
    });
    describe('debug levels', function() {
      let options = {
        loggers: {
          development: 'debug'
        },
        level: '',
        env: 'development',
        namespaces: 'debug-env:*,test:msg'
      };
      let debug = null;

      before(function() {
        process.env.DEBUG = options.namespaces;
        options.level = loopLevel;
        test.force(options);
        debug = test('test:msg');
      });

      it('default logger is correctly set', function() {
        let expected = idx < levels.indexOf('debug') ? 'emptyFunction' : '(';
        assert.isFunction(debug);
        assert.equal(fnName(debug), expected);
        // pino is loaded only on request
      });
      it('Levels are set correctyle ', function() {
        levels.forEach(function(item, i) {
          let expected = idx < i ? 'emptyFunction' : 'debug';
          assert.isFunction(debug[item]);
          assert.equal(fnName(debug[item]), expected);
        });
      });
    });
  });
});
