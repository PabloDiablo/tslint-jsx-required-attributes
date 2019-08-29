// Adapted from tslint-custom-rules-boilerplate
// https://github.com/eranshabi/tslint-custom-rules-boilerplate/blob/master/src/lintRunner.ts

import {Configuration, Linter, Replacement} from 'tslint';

export const helper = ({src, rule}) => {
    const linter = new Linter({fix: false});
    const isJsx = src.includes('import * as React') || src.includes('import React');

    linter.lint(
        isJsx ? 'test.tsx' : 'test.ts',
        src,
        Configuration.parseConfigFile({
            rules: {
                [rule.name || rule]: [true, ...rule.options]
            },
            rulesDirectory: 'src'
        })
    );

    return linter.getResult();
};

export const getFixedResult = ({src, rule}) => {
    const result = helper({src, rule});
    return Replacement.applyFixes(src, [result.failures[0].getFix()]);
};
