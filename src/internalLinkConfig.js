/**
 * @module internalLink/internalLinkConfig
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {
    CONFIG_TEST_MODE,
    CONFIG_AUTOCOMPLETE_URL,
    CONFIG_TITLE_URL,
    CONFIG_PREVIEW_URL
} from './constants';

/**
 * Initializes the default configuration.
 *
 * @extends module:core/plugin~Plugin
 */
export default class InternalLinkConfig extends Plugin {

    /**
     * The configuration used by the internal link features in the `@samhammer/ckeditor5-internalLink` package.
     *
     *		InlineEditor
     *			.create( editorElement, {
     * 				internallink: {
     *                  testmode: false,
     *                  autocompleteurl: '',
     *                  titleurl: '',
     *                  previewurl: ''
     *              }
     *			} )
     *			.then( ... )
     *			.catch( ... );
     *
     * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
     *
     * @interface ImageConfig
     */

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;

        editor.config.define(CONFIG_TEST_MODE, false);
        editor.config.define(CONFIG_AUTOCOMPLETE_URL, '');
        editor.config.define(CONFIG_TITLE_URL, '');
        editor.config.define(CONFIG_PREVIEW_URL, 'http://www.google.de?q={internalLinkId}');
    }

}
