import {helper, getFixedResult} from './lintRunner';
import {getErrorStringForTag, getErrorStringForAttribute, getErrorStringForEmptyAttribute} from './jsxRequiredAttributesRule';

describe('jsxRequiredAttributes', () => {
    const rule = {
        name: 'jsx-required-attributes',
        options: [
            [
                'data-id',
                {
                    tagNames: ['Link', 'a', 'button'],
                    attributeNames: ['onClick', 'onTapTouch']
                }
            ]
        ]
    };

    test('no violation when element is not in check list', () => {
        const src = `
            import * as React from 'react';

            function() {
                return (
                    <span>Hello</span>
                );
            }
        `;

        const result = helper({src, rule});

        expect(result.errorCount).toBe(0);
    });

    test('violation when element is missing attribute and element type is in check list', () => {
        const src = `
            import * as React from 'react';

            function() {
                return (
                    <button>Hello</button>
                );
            }
        `;

        const result = helper({src, rule});

        expect(result.failures[0].getFailure()).toEqual(getErrorStringForTag('button', 'data-id'));
        expect(result.errorCount).toBe(1);
    });

    test('violation when element is missing attribute and element has attribute in check list', () => {
        const src = `
            import * as React from 'react';

            function() {
                return (
                    <span onClick={() => {}}>Hello</span>
                );
            }
        `;
        const result = helper({src, rule});

        expect(result.failures[0].getFailure()).toEqual(getErrorStringForAttribute('onClick', 'data-id'));
        expect(result.errorCount).toBe(1);
    });

    test('no violation when element is in check list and contains attribute', () => {
        const src = `
            import * as React from 'react';

            function() {                
                return (
                    <button data-id="test">Hello</button>
                );
            }
        `;
        const result = helper({src, rule});

        expect(result.errorCount).toBe(0);
    });

    test('no violation when element has attribute in check list and contains attribute', () => {
        const src = `
            import * as React from 'react';

            function() {                
                return (
                    <div onClick={() => {}} data-id="test">Hello</div>
                );
            }
        `;

        const result = helper({src, rule});

        expect(result.errorCount).toBe(0);
    });

    test('violation when element has attribute in check list and contains attribute in spread', () => {
        const src = `
            import * as React from 'react';

            function() {
                const props = {'data-id': 'some.id'};
                
                return (
                    <div onClick={this.onClickOk} {...props}>OK</div>
                );
            }
        `;

        const result = helper({src, rule});

        expect(result.failures[0].getFailure()).toEqual(getErrorStringForAttribute('onClick', 'data-id'));
        expect(result.errorCount).toBe(1);
    });

    test('violation when element has required attribute in spread', () => {
        const src = `
            import * as React from 'react';

            function() {
                const props = {onClick: () => {}, 'data-id': 'some.id'};
                
                return (
                    <button {...props}>OK</button>
                );
            }
        `;

        const result = helper({src, rule});

        expect(result.failures[0].getFailure()).toEqual(getErrorStringForTag('button', 'data-id'));
        expect(result.errorCount).toBe(1);
    });

    test('no violation when element has attribute in spread in check list and does not contain attribute', () => {
        const src = `
            import * as React from 'react';

            function() {
                const props = {onClick: () => {}};
                
                return (
                    <div {...props}>OK</div>
                );
            }
        `;

        const result = helper({src, rule});

        expect(result.errorCount).toBe(0);
    });

    test('fix is suggested for element missing attribute', () => {
        const src = `
            import * as React from 'react';

            function() {                
                return (
                    <button>Hello</button>
                );
            }
        `;
        const result = getFixedResult({src, rule});

        expect(result).toContain('<button data-id=""');
    });

    test('fix is suggested for self-closing element missing attribute', () => {
        const src = `
            import * as React from 'react';

            function() {                
                return (
                    <Link />
                );
            }
        `;
        const result = getFixedResult({src, rule});

        expect(result).toContain('<Link data-id=""');
    });

    test('fix is suggested for self-closing with no spaces element missing attribute', () => {
        const src = `
            import * as React from 'react';

            function() {                
                return (
                    <Link/>
                );
            }
        `;
        const result = getFixedResult({src, rule});

        expect(result).toContain('<Link data-id=""');
    });
});
