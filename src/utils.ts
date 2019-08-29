// Adapted from tslint-microsoft-contrib and tsutils
// https://github.com/microsoft/tslint-microsoft-contrib/blob/master/src/utils/JsxAttribute.ts
// https://github.com/ajafff/tsutils/blob/master/typeguard/2.8/node.ts

import * as ts from 'typescript';

export type IJsxAttributesList = Record<string, ts.JsxAttribute>;

export function isJsxAttribute(node: ts.Node): node is ts.JsxAttribute {
    return node.kind === ts.SyntaxKind.JsxAttribute;
}

export function isJsxElement(node: ts.Node): node is ts.JsxElement {
    return node.kind === ts.SyntaxKind.JsxElement;
}

export function isJsxSelfClosingElement(node: ts.Node): node is ts.JsxSelfClosingElement {
    return node.kind === ts.SyntaxKind.JsxSelfClosingElement;
}

export function isJsxOpeningElement(node: ts.Node): node is ts.JsxOpeningElement {
    return node.kind === ts.SyntaxKind.JsxOpeningElement;
}

export function getPropName(node: ts.JsxAttribute): string | undefined {
    if (!isJsxAttribute(node)) {
        throw new Error('The node must be a JsxAttribute collected by the AST parser.');
    }

    return node.name ? node.name.text : undefined;
}

export function getAllAttributesFromJsxElement(node: ts.Node): ts.NodeArray<ts.JsxAttributeLike> | undefined {
    let attributes: ts.NodeArray<ts.JsxAttributeLike> | undefined;

    if (node === undefined) {
        return attributes;
    }

    if (isJsxElement(node)) {
        attributes = node.openingElement.attributes.properties;
    } else if (isJsxSelfClosingElement(node)) {
        attributes = node.attributes.properties;
    } else if (isJsxOpeningElement(node)) {
        attributes = node.attributes.properties;
    } else {
        throw new Error('The node must be a JsxElement, JsxSelfClosingElement or JsxOpeningElement.');
    }

    return attributes;
}

export function getJsxAttributesFromJsxElement(node: ts.Node): IJsxAttributesList {
    const attributesDictionary: IJsxAttributesList = {};
    const attributes = getAllAttributesFromJsxElement(node);

    if (attributes !== undefined) {
        attributes.forEach(attr => {
            if (!isJsxAttribute(attr)) {
                return;
            }

            const propName = getPropName(attr);
            if (propName !== undefined) {
                attributesDictionary[propName] = attr;
            }
        });
    }

    return attributesDictionary;
}
