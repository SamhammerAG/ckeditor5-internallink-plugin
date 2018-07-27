/**
 * @module internalLink/ui/internalLinkActionsView
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import { createButton, createFocusCycler, registerFocusableViews } from './uiutils';

import unlinkIcon from '../../theme/icons/unlink.svg';
import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';

import { VIEW_INTERNAL_LINK_ID_ATTRIBUTE } from '../constants';

/**
 * The link actions view class. This view displays link preview, allows
 * unlinking or editing the link.
 *
 * @extends module:ui/view~View
 */
export default class InternalLinkActionsView extends View {

    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);

        const t = locale.t;

        /**
         * A collection of views which can be focused in the form.
         *
         * @readonly
         * @protected
         * @member {module:ui/viewcollection~ViewCollection}
         */
        this.focusables = new ViewCollection();

        /**
         * Tracks information about DOM focus in the form.
         *
         * @readonly
         * @member {module:utils/focustracker~FocusTracker}
         */
        this.focusTracker = new FocusTracker();

        /**
         * Helps cycling over {@link #focusables} in the form.
         *
         * @readonly
         * @protected
         * @member {module:ui/focuscycler~FocusCycler}
         */
        this.focusCycler = createFocusCycler(this.focusables, this.focusTracker, this.keystrokes);

        /**
         * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
         *
         * @readonly
         * @member {module:utils/keystrokehandler~KeystrokeHandler}
         */
        this.keystrokes = new KeystrokeHandler();

        /**
         * The internalLink preview view.
         *
         * @member {module:ui/view~View}
         */
        this.previewButtonView = this.createPreviewButton();

        /**
         * The unlink button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        this.unlinkButtonView = createButton(t('Unlink'), unlinkIcon, this.locale);
        this.unlinkButtonView.delegate('execute').to(this, 'unlink');

        /**
         * The edit link button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        this.editButtonView = createButton(t('Edit link'), pencilIcon, this.locale);
        this.editButtonView.delegate('execute').to(this, 'edit');

        /**
         * Value of the "internalLinkId" attribute of the link to use in the {@link #previewButtonView}.
         *
         * @observable
         * @member {String}
         */
        this.set(VIEW_INTERNAL_LINK_ID_ATTRIBUTE);

        this.setTemplate({
            tag: 'div',

            attributes: {
                class: [
                    'ck',
                    'ck-internallink-actions',
                ],

                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },

            children: [
                this.previewButtonView,
                this.editButtonView,
                this.unlinkButtonView
            ]
        });
    }

    /**
     * @inheritDoc
     */
    render() {
        super.render();

        const childViews = [
            this.previewButtonView,
            this.editButtonView,
            this.unlinkButtonView
        ];

        // The two below commands are called this way in every plugin.
        // They ensure that focus is working correctly and that we can handle button clicks
        registerFocusableViews(childViews, this.focusables, this.focusTracker);
        this.keystrokes.listenTo(this.element);
    }

    /**
     * Focuses the fist {@link #focusables} in the actions.
     */
    focus() {
        this.focusCycler.focusFirst();
    }

    /**
     * Creates a link preview button.
     *
     * @private
     * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
     */
    createPreviewButton() {
        const button = new ButtonView(this.locale);
        const bind = this.bindTemplate;
        const t = this.t;

        button.set({
            withText: true,
            tooltip: t('Open link in new tab')
        });

        button.extendTemplate({
            attributes: {
                class: [
                    'ck',
                    'ck-link-actions__preview'
                ],
                internalLinkId: bind.to(VIEW_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId => !!internalLinkId),
                target: '_blank'
            }
        });

        button.bind('label').to(this, VIEW_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId => {
            return internalLinkId || t('This link is invalid');
        });

        button.bind('isEnabled').to(this, VIEW_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId => !!internalLinkId);

        button.template.tag = 'a';
        button.template.eventListeners = {};

        return button;
    }

}

/**
 * Fired when the {@link #editButtonView} is clicked.
 *
 * @event edit
 */

/**
 * Fired when the {@link #unlinkButtonView} is clicked.
 *
 * @event unlink
 */