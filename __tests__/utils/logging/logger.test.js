import { expect } from 'chai';
import { stubMethod, restore } from 'hanbi';
import StyleDictionary from '../../../lib/StyleDictionary.js';
import { Logger } from '../../../lib/utils/logging/logger.js';
import { verbosityInfo } from '../../../lib/utils/groupMessages.js';
import { logLevels } from '../../../lib/enums/index.js';

describe('Logger', () => {
  /** @type {import('../../../lib/utils/logging/logger.js').Logger} */
  let logger;
  let consoleErrorStub, consoleLogStub;

  beforeEach(() => {
    logger = new Logger({});
    consoleErrorStub = stubMethod(console, 'error');
    consoleLogStub = stubMethod(console, 'log');
  });

  afterEach(() => {
    restore();
  });

  describe('log', () => {
    it('should log error messages to console.error', () => {
      logger.log('error message', 'error');
      expect(consoleErrorStub.callCount).to.equal(1);
      expect(consoleErrorStub.firstCall.args[0]).to.include('✘ error message');
    });

    it('should log warn messages to console.log with orange color', () => {
      logger.log('warn message', 'warn');
      expect(consoleLogStub.callCount).to.equal(1);
      expect(consoleLogStub.firstCall.args[0]).to.include('⚠︎ warn message');
    });

    it('should log success messages to console.log with green color', () => {
      logger.log('success message', 'success');
      expect(consoleLogStub.callCount).to.equal(1);
      expect(consoleLogStub.firstCall.args[0]).to.include('✔︎ success message');
    });

    it('should log info messages to console.log', () => {
      logger.log('info message', 'info');
      expect(consoleLogStub.callCount).to.equal(1);
      expect(consoleLogStub.firstCall.args[0]).to.equal('info message\n');
    });

    it('should not log debug messages by default, because default threshold is info', () => {
      logger.log('debug message', 'debug');
      expect(consoleLogStub.callCount).to.equal(0);
    });

    it('should allow logging debug messages to console.log dimmed by specifying a debug threshold', () => {
      logger = new Logger({ threshold: logLevels.debug });
      logger.log('debug message', 'debug');
      expect(consoleLogStub.callCount).to.equal(1);
      expect(consoleLogStub.firstCall.args[0]).to.include('debug message');
    });

    it('should throw an error for throw level', () => {
      expect(() => logger.log('throw message', 'throw')).to.throw('throw message');
    });

    it('should not log if level is below threshold', () => {
      logger = new Logger({ threshold: 'warn' });
      logger.log('info message', 'info');
      expect(consoleLogStub.called).to.be.false;
      logger.log('warn message', 'warn');
      expect(consoleLogStub.callCount).to.equal(1);
    });

    it('should use messageVerbose if verbosity is verbose', () => {
      logger = new Logger({ verbosity: 'verbose' });
      logger.log('short', 'long verbose', 'info');
      expect(consoleLogStub.firstCall.args[0]).to.equal('long verbose\n');
    });

    it('should append verbosityInfo if messageVerbose and not verbose', () => {
      logger = new Logger({ verbosity: 'normal' });
      logger.log('short', 'long verbose', 'info');
      expect(consoleLogStub.firstCall.args[0]).to.equal(`short
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`);
    });

    it('should use config[type].level override', () => {
      logger = new Logger({ 'warn.collisions': { level: 'error' } });
      logger.log('collision!', 'warn.collisions');
      expect(consoleErrorStub.callCount).to.equal(1);
      expect(consoleErrorStub.firstCall.args[0]).to.include('collision!');
    });

    it('should use config[subType].level override', () => {
      logger = new Logger({ warn: { level: 'error' } });
      logger.log('warn as error', 'warn.collisions');
      expect(consoleErrorStub.callCount).to.equal(1);
      expect(consoleErrorStub.firstCall.args[0]).to.include('warn as error');
    });

    it('should throw an error if the log to be added does not use a correct logLevel prefix', () => {
      expect(() => logger.add('foo.bar', 'baz.qux', { message: 'some log' })).to.throw(
        `When adding logs, the "type" argument must be a string with one of the allowed log level prefixes: [throw, error, warn, success, info, debug]. We got foo instead.`,
      );
    });

    it('the test above cannot have its error silenced via logger', () => {
      // attempt to silence via threshold as well as setting throws to be logged as debugs
      logger = new Logger({ threshold: logLevels.silent, throw: 'debug' });
      // still errors
      expect(() => logger.add('foo.bar', 'baz.qux', { message: 'some log' })).to.throw();
    });

    it('throw an error if log method itself does not use a correct log level', () => {
      const errMessage = `When adding logs, the "type" argument must be a string with one of the allowed log level prefixes: [throw, error, warn, success, info, debug]. We got foo instead.`;
      expect(() => logger.log('some log', 'foo.bar')).to.throw(errMessage);
      expect(() => logger.log('some log', 'foo')).to.throw(errMessage);
      expect(() => logger.log('some log', 'info')).to.not.throw();
      expect(() => logger.log('some log')).to.not.throw();
    });

    it('the test above cannot have its error silenced via logger', () => {
      // attempt to silence via threshold as well as setting throws to be logged as debugs
      logger = new Logger({ threshold: logLevels.silent, throw: 'debug' });
      // still errors
      expect(() => logger.log('some log', 'foo.bar')).to.throw();
    });
  });

  describe('add, delete, count, get, flush', () => {
    it('should add logs and count them', () => {
      logger.add('warn.collisions', '{foo}', 'bar');
      logger.add('warn.collisions', '{foo}', 'baz');
      logger.add('warn.collisions', '{qux}', 'bar');
      logger.add('warn.collisions', '{qux}', 'baz');
      expect(logger.count('warn.collisions')).to.equal(4);
      expect(logger.get('warn.collisions').get('{foo}')).to.eql(['bar', 'baz']);
      expect(logger.get('warn.collisions').get('{qux}')).to.eql(['bar', 'baz']);
    });

    it('should delete logs for a given key', () => {
      logger.add('warn.collisions', '{foo}', 'bar');
      logger.add('warn.collisions', '{foo}', 'baz');
      logger.delete('warn.collisions', '{foo}');
      expect(logger.count('warn.collisions')).to.equal(0);
    });

    it('should get a clone of the logs for a type', () => {
      logger.add('warn.collisions', '{foo}', 'bar');
      const logs = logger.get('warn.collisions');
      const another = logger.get('warn.collisions');
      expect(logs instanceof Map).to.be.true;
      expect(logs).to.not.equal(another);
      expect(logs.get('{foo}')).to.eql(['bar']);
    });

    it('should flush logs and clear them', () => {
      logger.add('warn.collisions', '{foo}', 'bar');
      const flushed = logger.flush('warn.collisions');
      expect(logger.count('warn.collisions')).to.equal(0);
      expect(flushed instanceof Map).to.be.true;
      expect(flushed.get('{foo}')).to.eql(['bar']);
    });

    it('should throw if log type does not exist', () => {
      expect(() => logger.delete('nonexistent.type', '{foo}', 'bar')).to.throw(
        'Log type "nonexistent.type" does not exist.',
      );
    });
  });

  describe('log levels', () => {
    it('should have a default log level for logs', () => {
      logger.log('something');
      // defaults to info log
      expect(consoleLogStub.firstCall.args[0]).to.equal('something\n');
    });

    it('should allow setting the log level for log categories globally', () => {
      const logger = new Logger({
        info: 'warn',
      });
      logger.log('something', 'info');
      expect(consoleLogStub.firstCall.args[0]).to.include('⚠︎ something');
    });

    it('should allow setting the log level for logs specifically', () => {
      const logger = new Logger({
        info: 'error',
        'info.subtype': 'warn',
      });
      logger.log('something', 'info.subtype');
      expect(consoleLogStub.firstCall.args[0]).to.include('⚠︎ something');
      logger.log('something', 'info');
      expect(consoleErrorStub.firstCall.args[0]).to.equal('✘ something\n');
    });
  });

  describe('verbosity levels', () => {
    it('should have a default verbosity level for logs', () => {
      logger.log('something', 'something verbose', 'info');
      // defaults to info log
      expect(consoleLogStub.firstCall.args[0]).to.equal(`something\n${verbosityInfo}\n`);
    });

    it('should allow setting the verbosity level globally', () => {
      const logger = new Logger({
        verbosity: 'verbose',
      });
      logger.log('something', 'something verbose', 'info');
      expect(consoleLogStub.firstCall.args[0]).to.equal(`something verbose\n`);
    });

    it('should allow setting the verbosity level for log categories globally', () => {
      const logger = new Logger({
        verbosity: 'default',
        info: {
          verbosity: 'verbose',
        },
      });
      logger.log('something', 'something verbose', 'info');
      expect(consoleLogStub.firstCall.args[0]).to.equal(`something verbose\n`);
    });

    it('should allow setting the verbosity level for logs specifically', () => {
      const logger = new Logger({
        verbosity: 'default',
        info: {
          verbosity: 'default',
        },
        'info.test': {
          verbosity: 'verbose',
        },
      });
      logger.log('something', 'something verbose', 'info.test');
      expect(consoleLogStub.firstCall.args[0]).to.equal(`something verbose\n`);
    });
  });

  describe('subclass log types', () => {
    class ExtensionLogger extends Logger {
      /**
       * @param {string} message
       */
      throw(message) {
        throw new Error(`${message} 123`);
      }

      /**
       * @param {string} message
       */
      error(message) {
        console.error(`${message} 456`);
      }

      /**
       * @param {string} message
       */
      warn(message) {
        /* eslint-disable no-console */
        console.log(`${message} 789`);
      }

      /**
       * @param {string} message
       */
      success(message) {
        console.log(`${message} 321`);
      }

      /**
       * @param {string} message
       */
      info(message) {
        console.log(`${message} 654`);
      }

      /**
       * @param {string} message
       */
      debug(message) {
        console.log(`${message} 987`);
        /* eslint-enable no-console */
      }
    }
    const sd = new StyleDictionary({ logger: new ExtensionLogger() });

    it('should allow overriding the way errors are thrown', () => {
      expect(() => {
        sd.logger.log('throw example', 'throw.test');
      }).to.throw('throw example 123');
    });

    it('should allow overriding the way errors are logged', () => {
      sd.logger.log('error example', 'error.test');
      expect(consoleErrorStub.firstCall.args[0]).to.equal('error example 456');
    });

    it('should allow overriding the way warnings are logged', () => {
      sd.logger.log('warn example', 'warn.test');
      expect(consoleLogStub.firstCall.args[0]).to.equal('warn example 789');
    });

    it('should allow overriding the way success logs are logged', () => {
      sd.logger.log('success example', 'success.test');
      expect(consoleLogStub.firstCall.args[0]).to.equal('success example 321');
    });

    it('should allow overriding the way regular info logs are logged', () => {
      sd.logger.log('info example', 'info.test');
      expect(consoleLogStub.firstCall.args[0]).to.equal('info example 654');
    });

    it('should allow overriding the way debug logs are logged', () => {
      sd.logger = new ExtensionLogger({ threshold: logLevels.debug });
      sd.logger.log('debug example', 'debug.test');
      expect(consoleLogStub.firstCall.args[0]).to.equal('debug example 987');
    });
  });

  describe('backwards compatibility', () => {
    it('should detect whether user has opted into the new system or still using the old', () => {
      const loggerOld = new Logger({
        warnings: 'error',
      });
      const loggerNew = new Logger({
        warn: 'throw',
      });
      const loggerMixed = new Logger({
        warnings: 'error',
        warn: 'info',
      });

      expect(loggerOld.__handleBackwardsCompatibility).to.be.true;
      expect(loggerNew.__handleBackwardsCompatibility).to.be.false;
      expect(loggerMixed.__handleBackwardsCompatibility).to.be.false;
    });

    it('should allow using old way of setting transform errors to just be console logged', () => {
      const logger = new Logger({
        errors: { transforms: 'console' },
      });
      logger.log('some transform error', 'error.transforms');
      expect(consoleLogStub.firstCall.args[0]).to.equal('some transform error\n');
    });

    it('should allow using old way of setting broken reference errors to just be console logged', () => {
      const logger = new Logger({
        errors: { brokenReferences: 'console' },
      });
      logger.log('some reference error', 'throw.references');
      expect(consoleLogStub.firstCall.args[0]).to.equal('some reference error\n');
    });

    it('should allow using old way of setting warnings to be disabled', () => {
      const logger = new Logger({
        warnings: 'disabled',
      });
      logger.log('some warning', 'warn');
      expect(consoleLogStub.called).to.be.false;
    });

    it('should allow using old way of setting warnings to be thrown', () => {
      const logger = new Logger({
        warnings: 'error',
      });
      expect(() => logger.log('some warning', 'warn')).to.throw('some warning');
    });
  });
});
