import { expect } from 'chai';
import { restore, stubMethod } from 'hanbi';
import StyleDictionary from 'style-dictionary';
import { buildPath } from '../_constants.js';
import { cleanConsoleOutput, clearOutput } from '../../__tests__/__helpers.js';
import { formats, logLevels, logVerbosityLevels } from '../../lib/enums/index.js';

const TRANSFORM = 'sd-utils/multipleOfFour';
const ACTION = 'sd-utils/log';
const LOG_NAMESPACE = `warn.${TRANSFORM}`;

/**
 * This is created by the third party package that contains a plugin/integration for Style Dictionary
 * @param {StyleDictionary} sd
 */
function registerThirdPartyHooks(sd) {
  // transform that collects logs
  sd.registerTransform({
    name: TRANSFORM,
    type: 'value',
    filter: (token) => token.$type === 'dimension',
    transform: (token, _config, options) => {
      const { logger } = options;
      const dividedByFour = token.$value / 4;
      if (!Number.isInteger(dividedByFour)) {
        logger.add(LOG_NAMESPACE, token.key, {
          message: 'Value is not a multiple of 4',
          value: token.$value,
          result: dividedByFour,
          transform: TRANSFORM,
        });
      }
      return token.$value;
    },
  });

  // action that fires at the end to provide a warning from the collected logs
  sd.registerAction({
    name: ACTION,
    do: (_dictionary, _config, options) => {
      const { logger } = options;
      if (logger.count(LOG_NAMESPACE) > 0) {
        const logs = logger.flush(LOG_NAMESPACE);
        const firstLog = Array.from(logs.values())[0][0];
        const message = `Dimensions that are not multiples of 4 were found with transform \`${firstLog.transform}\` for ${logs.size} tokens.`;
        const messageVerbose = `${message}\n${firstLog.message}, for the following tokens:
  ${Array.from(logs.entries())
    .map(
      ([key, tokenLogs]) =>
        `${key} -> ${tokenLogs[0].value} which divided by four is ${tokenLogs[0].result}`,
    )
    .join('\n  ')}`;

        logger.log(message, messageVerbose, LOG_NAMESPACE);
      }
    },
    // we flush logs already in the do function
    undo: () => {},
  });
}

/** @type {import('style-dictionary').Config} */
const baseCfg = {
  tokens: {
    dimensions: {
      $type: 'dimension',
      small: {
        $value: 8,
      },
      big: {
        $value: 15,
      },
      huge: {
        $value: 22,
      },
    },
  },
  platforms: {
    dummy: {
      buildPath,
      transforms: [TRANSFORM],
      actions: [ACTION],
      files: [
        {
          format: formats.cssVariables,
          destination: 'third-party.css',
        },
      ],
    },
  },
};

describe(`integration >`, () => {
  let logStub;
  beforeEach(() => {
    logStub = stubMethod(console, 'log');
  });
  afterEach(() => {
    restore();
    clearOutput(buildPath);
  });

  describe(`logger >`, () => {
    it('should support subclassers to write logs to the logger under their own namespace, which can then later be logged', async () => {
      // What the user of SD and the integration package does:
      const sd = new StyleDictionary(baseCfg);
      registerThirdPartyHooks(sd);
      await sd.buildAllPlatforms();

      // later when we have applied the Logger to all built-in logs in SD
      // we can just silence info/success logs and replace below with .firstCall
      // for now we just "know" we have some info/success logs before we get the warning as the third log
      const warning = Array.from(logStub.calls)[2].args[0];
      await expect(cleanConsoleOutput(warning)).to.matchSnapshot();
    });

    it('should also work with a different verbosity', async () => {
      // What the user of SD and the integration package does:
      const sd = new StyleDictionary({
        ...baseCfg,
        log: {
          verbosity: logVerbosityLevels.verbose,
        },
      });
      registerThirdPartyHooks(sd);
      await sd.buildAllPlatforms();

      const warning = Array.from(logStub.calls)[2].args[0];
      await expect(cleanConsoleOutput(warning)).to.matchSnapshot();
    });

    it('should also work with a different log levels set', async () => {
      // What the user of SD and the integration package does:
      const sd = new StyleDictionary({
        ...baseCfg,
        log: {
          warn: logLevels.info,
        },
      });
      registerThirdPartyHooks(sd);
      await sd.buildAllPlatforms();

      const warning = Array.from(logStub.calls)[2].args[0];
      await expect(warning).to.matchSnapshot();
    });

    it('should also work with a different log levels set on the namespace level specifically', async () => {
      // What the user of SD and the integration package does:
      const sd = new StyleDictionary({
        ...baseCfg,
        log: {
          LOG_NAMESPACE: logLevels.info,
        },
      });
      registerThirdPartyHooks(sd);
      await sd.buildAllPlatforms();

      const warning = Array.from(logStub.calls)[2].args[0];
      await expect(cleanConsoleOutput(warning)).to.matchSnapshot();
    });
  });
});
