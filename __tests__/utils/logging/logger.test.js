import { expect } from 'chai';
import { stubMethod, restore } from 'hanbi';
import chalk from 'chalk';
import { Logger } from '../../../lib/utils/logging/logger.js';

// logger.test.js

describe('Logger', () => {
  let logger;
  let consoleErrorStub, consoleLogStub;
  const defaultConfig = {};

  beforeEach(() => {
    logger = new Logger(defaultConfig);
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
      expect(consoleLogStub.firstCall.args[0]).to.equal('info message');
    });

    it('should log debug messages to console.log dimmed', () => {
      logger.log('debug message', 'debug');
      expect(consoleLogStub.callCount).to.equal(1);
      expect(consoleLogStub.firstCall.args[0]).to.equal(chalk.dim('debug message'));
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
      logger.log('short', 'info', 'long verbose');
      expect(consoleLogStub.firstCall.args[0]).to.equal('long verbose');
    });

    it('should append verbosityInfo if messageVerbose and not verbose', () => {
      logger = new Logger({ verbosity: 'normal' });
      logger.log('short', 'info', 'long verbose');
      expect(consoleLogStub.firstCall.args[0]).to.equal(`short
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`);
    });

    it('should use logConfig[type].level override', () => {
      logger = new Logger({ 'warn.collisions': { level: 'error' } });
      logger.log('collision!', 'warn.collisions');
      expect(consoleErrorStub.callCount).to.equal(1);
      expect(consoleErrorStub.firstCall.args[0]).to.include('collision!');
    });

    it('should use logConfig[subType].level override', () => {
      logger = new Logger({ warn: { level: 'error' } });
      logger.log('warn as error', 'warn.collisions');
      expect(consoleErrorStub.callCount).to.equal(1);
      expect(consoleErrorStub.firstCall.args[0]).to.include('warn as error');
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
      expect(() => logger.add('nonexistent.type', '{foo}', 'bar')).to.throw(
        'Log type "nonexistent.type" does not exist.',
      );
    });
  });
});
