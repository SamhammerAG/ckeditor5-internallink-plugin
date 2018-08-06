/**
 * @module internalLink/internalLinkCommands
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import LinkCommand from './command/internalLinkCommand';
import UnlinkCommand from './command/internalUnlinkCommand';

import {
    COMMAND_LINK,
    COMMAND_UNLINK } from './constants';

/**
 * Plugin used to register the commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class InternalLinkCommands extends Plugin {

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;

        editor.commands.add(COMMAND_LINK, new LinkCommand(editor));
        editor.commands.add(COMMAND_UNLINK, new UnlinkCommand(editor));
    }

}
