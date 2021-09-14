/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module internalLink/findlinkrange
 */

import { MODEL_INTERNAL_LINK_ID_ATTRIBUTE } from './constants';

/**
 * Returns a range containing the entire link in which the given `position` is placed.
 *
 * It can be used e.g. to get the entire range on which the `internalLinkId` attribute needs to be changed when having a
 * selection inside a link.
 *
 * @param {module:engine/model/position~Position} position The start position.
 * @param {String} value The `internalLinkId` attribute value.
 * @returns {module:engine/model/range~Range} The link range.
 */
export default function findLinkRange(position, value, model) {
    return model.createRange(_findBound(position, value, true, model), _findBound(position, value, false, model));
}

// Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same `internalLinkId` attribute value
// and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
//
// @param {module:engine/model/position~Position} position The start position.
// @param {String} value The `internalLinkId` attribute value.
// @param {Boolean} lookBack Whether the walk direction is forward (`false`) or backward (`true`).
// @returns {module:engine/model/position~Position} The position just before the last matched node.
function _findBound(position, value, lookBack, model) {
    // Get node before or after position (depends on `lookBack` flag).
    // When position is inside text node then start searching from text node.
    let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

    let lastNode = null;

    while (node && node.getAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE) == value) {
        lastNode = node;
        node = lookBack ? node.previousSibling : node.nextSibling;
    }

    return lastNode ? model.createPositionAt(lastNode, lookBack ? 'before' : 'after') : position;
}
