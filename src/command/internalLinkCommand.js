/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/internalLinkCommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import findLinkRange from './findlinkrange';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

/**
 * The internal link command. It is used by the {@link module:internalLink/internalLink~internalLink internal link feature}.
 *
 * @extends module:core/command~Command
 */
export default class InternalLinkCommand extends Command {

    /**
     * The value of the `'internalLinkId'` attribute if the start of the selection is located in a node with this attribute.
     *
     * @observable
     * @readonly
     * @member {Object|undefined} #value
     */

    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const doc = model.document;

        this.value = doc.selection.getAttribute('internalLinkId');
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'internalLinkId');
    }

    /**
     * Executes the command.
     *
     * When the selection is non-collapsed, the `internalLinkId` attribute will be applied to nodes inside the selection, but only to
     * those nodes where the `internalLinkId` attribute is allowed (disallowed nodes will be omitted).
     *
     * When the selection is collapsed and is not inside the text with the `internalLinkId` attribute, the
     * new {@link module:engine/model/text~Text Text node} with the `internalLinkId` attribute will be inserted in place of caret, but
     * only if such element is allowed in this place. The `_data` of the inserted text will equal the `internalLinkId` parameter.
     * The selection will be updated to wrap the just inserted text node.
     *
     * When the selection is collapsed and inside the text with the `internalLinkId` attribute, the attribute value will be updated.
     *
     * @fires execute
     * @param {String} internalLinkId Link destination.
     */
    execute(internalLinkId) {
        const model = this.editor.model;
        const selection = model.document.selection;

        model.change(writer => {
            // If selection is collapsed then update selected link or insert new one at the place of caret.
            if (selection.isCollapsed) {
                const position = selection.getFirstPosition();

                // When selection is inside text with `internalLinkId` attribute.
                if (selection.hasAttribute('internalLinkId')) {
                    // Then update `internalLinkId` value.
                    const linkRange = findLinkRange(selection.getFirstPosition(), selection.getAttribute('internalLinkId'));

                    writer.setAttribute('internalLinkId', internalLinkId, linkRange);

                    // Create new range wrapping changed link.
                    writer.setSelection(linkRange);
                }
                // If not then insert text node with `internalLinkId` attribute in place of caret.
                // However, since selection in collapsed, attribute value will be used as data for text node.
                // So, if `internalLinkId` is empty, do not create text node.
                else if (internalLinkId !== '') {
                    const attributes = toMap(selection.getAttributes());

                    attributes.set('internalLinkId', internalLinkId);

                    const node = writer.createText(internalLinkId, attributes);

                    writer.insert(node, position);

                    // Create new range wrapping created node.
                    writer.setSelection(Range.createOn(node));
                }
            } else {
                // If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
                // omitting nodes where `internalLinkId` attribute is disallowed.
                const ranges = model.schema.getValidRanges(selection.getRanges(), 'internalLinkId');

                for (const range of ranges) {
                    writer.setAttribute('internalLinkId', internalLinkId, range);
                }
            }
        });
    }

}
