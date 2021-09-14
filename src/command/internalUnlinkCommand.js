/**
 * @module internalLink/unlinkcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import findLinkRange from '../util/findlinkrange';

import { MODEL_INTERNAL_LINK_ID_ATTRIBUTE } from '../util/constants';

/**
 * The unlink command. It is used by the {@link module:link/link~Link link plugin}.
 *
 * @extends module:core/command~Command
 */
export default class InternalUnlinkCommand extends Command {

    /**
     * @inheritDoc
     */
    refresh() {
        this.isEnabled = this.editor.model.document.selection.hasAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE);
    }

    /**
     * Executes the command.
     *
     * When the selection is collapsed, removes the `internalLinkId` attribute from each node with the same `internalLinkId` attribute value
     * When the selection is non-collapsed, removes the `internalLinkId` attribute from each node in selected ranges.
     *
     * @fires execute
     */
    execute() {
        const model = this.editor.model;
        const selection = model.document.selection;

        model.change(writer => {
            // Get ranges to unlink.
            const rangesToUnlink = selection.isCollapsed
                ? [findLinkRange(selection.getFirstPosition(), selection.getAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE), model)]
                : selection.getRanges();

            // Remove `internalLinkId` attribute from specified ranges.
            for (const range of rangesToUnlink) {
                writer.removeAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE, range);
            }
        });
    }

}
