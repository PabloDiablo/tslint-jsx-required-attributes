import * as ts from 'typescript';
import * as Lint from 'tslint';
import {IRuleMetadata} from 'tslint';

import {getJsxAttributesFromJsxElement, IJsxAttributesList, isJsxSelfClosingElement, isJsxElement} from './utils';

type IOptions = Record<
    string,
    {
        tagNames: string[];
        attributeNames: string[];
    }
>;

const OPTIONS_TAG_NAMES = 'tagNames';
const OPTIONS_ATTRIBUTE_NAMES = 'attributeNames';

export function getErrorStringForTag(tagName: string, requiredAttribute: string): string {
    return `Element ${tagName} must have ${requiredAttribute} prop.`;
}

export function getErrorStringForAttribute(attributeName: string, requiredAttribute: string): string {
    return `Element with prop ${attributeName} must have ${requiredAttribute} prop.`;
}

export function getErrorStringForEmptyAttribute(requiredAttribute: string): string {
    return `${requiredAttribute} must not be empty.`;
}

function getConfigProperty<T>(config: unknown, prop: string): T | undefined {
    if (typeof config === 'object' && config !== null && config.hasOwnProperty(prop)) {
        return config[prop];
    }
}

function getConfigPropertyStringArray(config: unknown, prop: string): string[] {
    const value = getConfigProperty(config, prop);
    if (Array.isArray(value)) {
        return value.filter(s => typeof s === 'string');
    }

    return [];
}

export class Rule extends Lint.Rules.AbstractRule {
    static readonly metadata: IRuleMetadata = {
        ruleName: 'jsx-required-attributes',
        type: 'functionality',
        description: '',
        options: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    [OPTIONS_TAG_NAMES]: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    [OPTIONS_ATTRIBUTE_NAMES]: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        optionsDescription: 'Specify an attribute which must exist for specified elements',
        optionExamples: [true, ['data-id', {[OPTIONS_TAG_NAMES]: ['a'], [OPTIONS_ATTRIBUTE_NAMES]: ['onClick']}]],
        rationale: 'Require specified elements to contain a specified attribute',
        typescriptOnly: false
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return sourceFile.languageVariant === ts.LanguageVariant.JSX ? this.applyWithFunction(sourceFile, walk, this.parseOptions(this.getOptions())) : [];
    }

    private parseOptions(options: Lint.IOptions): IOptions {
        const args = options.ruleArguments;
        let opt: IOptions = {};

        args.forEach(o => {
            if (Array.isArray(o) && o.length === 2) {
                const requiredAttribute = o[0];
                const config = o[1];

                if (typeof requiredAttribute === 'string') {
                    opt[requiredAttribute] = {
                        tagNames: getConfigPropertyStringArray(config, OPTIONS_TAG_NAMES),
                        attributeNames: getConfigPropertyStringArray(config, OPTIONS_ATTRIBUTE_NAMES)
                    };
                }
            }
        });

        return opt;
    }
}

function containsTargetAttribute(attributes: IJsxAttributesList, targetAttributes: string[]): boolean {
    return targetAttributes.some(attr => attributes[attr] !== undefined);
}

function getFix(node: ts.Node, attr: string): Lint.Fix {
    let startPos = node.end - 1;

    if (isJsxSelfClosingElement(node)) {
        startPos = node.end - 2;

        const fullText = node.getFullText();
        const textLength = fullText.length;

        if (fullText.substring(textLength - 3, textLength - 2) === ' ') {
            startPos = node.end - 3;
        }
    }

    return Lint.Replacement.appendText(startPos, ` ${attr}=""`);
}

function walk(ctx: Lint.WalkContext<IOptions>) {
    function checkElement(node: ts.JsxOpeningLikeElement): void {
        const tagName = node.tagName.getText();
        const requiredAttributes = Object.keys(ctx.options);

        if (!tagName) {
            return;
        }

        const attributes = getJsxAttributesFromJsxElement(node);

        requiredAttributes.forEach(requiredAttribute => {
            const targetTagNames = ctx.options[requiredAttribute].tagNames;
            const targetAttributes = ctx.options[requiredAttribute].attributeNames;

            if (!containsTargetAttribute(attributes, [requiredAttribute])) {
                // this is a target element
                if (targetTagNames.includes(tagName)) {
                    ctx.addFailureAtNode(node, getErrorStringForTag(tagName, requiredAttribute), getFix(node, requiredAttribute));
                }

                // this is an element with a target attribute
                if (containsTargetAttribute(attributes, targetAttributes)) {
                    const triggeredAttribute = targetAttributes.find(attr => attributes[attr] !== undefined);

                    ctx.addFailureAtNode(node, getErrorStringForAttribute(triggeredAttribute, requiredAttribute), getFix(node, requiredAttribute));
                }
            }
        });
    }

    function cb(node: ts.Node): void {
        if (isJsxElement(node)) {
            checkElement(node.openingElement);
        } else if (isJsxSelfClosingElement(node)) {
            checkElement(node);
        }

        return ts.forEachChild(node, cb);
    }

    return ts.forEachChild(ctx.sourceFile, cb);
}
