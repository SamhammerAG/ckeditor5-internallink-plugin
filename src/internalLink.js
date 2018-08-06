/**
 * @module InternalLink/InternalLink
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import InternalLinkConfig from './config/internalLinkConfig';
import InternalLinkCommandRegistration from './command/internalLinkCommandRegistration';
import InternalLinkEditing from './internalLinkEditing';
import InternalLinkUi from './ui/internalLinkUi';

/**
 * The internal link plugin. It introduces the Link and Unlink buttons for internal links.
 *
 * It loads the {@link module:InternalLink/InlineLink inline link feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class InternalLink extends Plugin {

    /**
     * @inheritDoc
     */
    static get requires() {
        return [InternalLinkConfig, InternalLinkCommandRegistration, InternalLinkEditing, InternalLinkUi];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'internalLink';
    }

}
