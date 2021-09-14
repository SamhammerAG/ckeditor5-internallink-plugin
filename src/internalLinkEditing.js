/**
 * @module internalLink/internalLinkEditing
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createLinkElement } from './util/utils';
import twostepcaretmovement from '@ckeditor/ckeditor5-typing/src/twostepcaretmovement';
import inlineHighlight from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';

import '../theme/editing.css';

import {
    VIEW_INTERNAL_LINK_TAG,
    VIEW_INTERNAL_LINK_ID_ATTRIBUTE,
    MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
    CLASS_HIGHLIGHT } from './util/constants';

/**
 * The link engine feature.
 *
 * It introduces the `internalLinkId="id"` attribute in the model which renders to
 * the view as a `<internallink internalLinkId="1d">` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class InternalLinkEditing extends Plugin {

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;

        // Allow link attribute on all inline nodes.
        editor.model.schema.extend('$text', { allowAttributes: MODEL_INTERNAL_LINK_ID_ATTRIBUTE });

        editor.conversion.for('dataDowncast')
            .attributeToElement({
                model: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
                view: createLinkElement });

        editor.conversion.for('editingDowncast')
            .attributeToElement({
                model: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
                view: (internalLinkId, conversionApi) => {
                    return createLinkElement(internalLinkId, conversionApi);
                }
            });

        editor.conversion.for('upcast')
            .elementToAttribute({
                view: {
                    name: VIEW_INTERNAL_LINK_TAG,
                    attributes: {
                        // This is important to ensure that the internal links are not
                        // removed if text with an internal link is pasted to ckeditor
                        [ VIEW_INTERNAL_LINK_ID_ATTRIBUTE ]: true
                    }
                },
                model: {
                    // The internal attribute name
                    key: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
                    // The html tag attribute
                    value: viewElement => viewElement.getAttribute(VIEW_INTERNAL_LINK_ID_ATTRIBUTE)
                }
            });

        // Enable two-step caret movement for `internalLinkId` attribute.
        editor.plugins.get(twostepcaretmovement).registerAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE);

        // Setup highlight over selected link.
        inlineHighlight(editor, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, VIEW_INTERNAL_LINK_TAG, CLASS_HIGHLIGHT);
    }

}
