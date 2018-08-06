/**
 * @module internalLink/internalLinkCommandRegistration
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import LinkCommand from './internalLinkCommand';
import UnlinkCommand from './internalUnlinkCommand';

import {
    COMMAND_LINK,
    COMMAND_UNLINK } from '../util/constants';

/**
 * Plugin used to register the commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class internalLinkCommandRegistration extends Plugin {

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;

        editor.commands.add(COMMAND_LINK, new LinkCommand(editor));
        editor.commands.add(COMMAND_UNLINK, new UnlinkCommand(editor));
    }

}
