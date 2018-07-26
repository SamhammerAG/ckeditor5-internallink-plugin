/**
 * @module internalLink/internalLinkCommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { MODEL_INTERNAL_LINK_ID_ATTRIBUTE } from '../constants';

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

        this.value = doc.selection.getAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE);
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, MODEL_INTERNAL_LINK_ID_ATTRIBUTE);
    }

    /**
     * Executes the command.
     *
     * The `internalLinkId` attribute will be applied to nodes inside the selection, but only to
     * those nodes where the `internalLinkId` attribute is allowed (disallowed nodes will be omitted).
     *
     * @fires execute
     * @param {String} internalLinkId Link destination.
     */
    execute(internalLinkId) {
        const model = this.editor.model;
        const selection = model.document.selection;

        model.change(writer => {
            const ranges = model.schema.getValidRanges(selection.getRanges(), MODEL_INTERNAL_LINK_ID_ATTRIBUTE);

            for (const range of ranges) {
                writer.setAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId, range);
            }
        });
    }

}
