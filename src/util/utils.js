/**
 * @module link/utils
 */

import { VIEW_INTERNAL_LINK_TAG } from './constants';

const linkElementSymbol = Symbol('internalLinkElement');

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isLinkElement(node) {
    return node.is('attributeElement') && !!node.getCustomProperty(linkElementSymbol);
}

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `internalLinkId` attribute.
 *
 * @param {String} internalLinkId
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement(internalLinkId, writer) {
    // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
    const linkElement = writer.createAttributeElement(VIEW_INTERNAL_LINK_TAG, { internalLinkId }, { priority: 5 });
    writer.setCustomProperty(linkElementSymbol, true, linkElement);

    return linkElement;
}

/**
 * Replaces a placeholder inside an url with the actual value.
 * The value is correctly encoded inside this function.
 * @param {*} url The url with placeholder
 * @param {*} placeholder A placeholder to replace
 * @param {*} value The value to insert instead of the placeholder
 */
export function replacePlaceholderInUrl(url, placeholder, value) {
    return url.replace(placeholder, encodeURI(value));
}
