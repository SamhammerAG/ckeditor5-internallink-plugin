/**
 * @module InternalLink/InternalLink
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import InternalLinkEditing from './internalLinkEditing';
import InternalLinkUi from './internalLinkUi';

/**
 * The internal link plugin. It introduces the Link and Unlink buttons for internal links.
 *
 * It loads the {@link module:InlineLink/InlineLink inline link feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class InlineLink extends Plugin {

    /**
     * @inheritDoc
     */
    static get requires() {
        return [InternalLinkEditing, InternalLinkUi];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'internalLink';
    }

}
