/**
 * @module internalLink/ui/InternalLinkFormView
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import { createButton, createFocusCycler, registerFocusableViews } from './uiutils';

/**
 * The internal link form view controller class.
 *
 * See {@link module:internalLink/ui/InternalLinkFormView~InternalLinkFormView}.
 *
 * @extends module:ui/view~View
 */
export default class InternalLinkFormView extends View {

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
         * The id input view.
         *
         * @member {module:ui/labeledinput/labeledinputview~LabeledInputView}
         */
        this.idInputView = this.createIdInput();

        /**
         * The Save button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        this.saveButtonView = createButton(t('Save'), checkIcon, this.locale, 'ck-button-save');
        this.saveButtonView.type = 'submit';

        /**
         * The Cancel button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        this.cancelButtonView = createButton(t('Cancel'), cancelIcon, this.locale, 'ck-button-cancel');
        this.cancelButtonView.delegate('execute').to(this, 'cancel');

        this.setTemplate({
            tag: 'form',

            attributes: {
                class: [
                    'ck',
                    'ck-internalLink-form',
                ],

                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },

            children: [
                this.idInputView,
                this.saveButtonView,
                this.cancelButtonView
            ]
        });
    }

    /**
     * @inheritDoc
     */
    render() {
        super.render();

        submitHandler({
            view: this
        });

        const childViews = [
            this.idInputView,
            this.saveButtonView,
            this.cancelButtonView
        ];

        // The two below commands are called this way in every plugin.
        // They ensure that focus is working correctly and that we can handle button clicks
        registerFocusableViews(childViews, this.focusables, this.focusTracker);
        this.keystrokes.listenTo(this.element);
    }

    /**
     * Focuses the fist {@link #focusables} in the form.
     */
    focus() {
        this.focusCycler.focusFirst();
    }

    /**
     * Creates a labeled input view to input the id.
     *
     * @private
     * @returns {module:ui/labeledinput/labeledinputview~LabeledInputView} Labeled input view instance.
     */
    createIdInput() {
        const t = this.locale.t;

        const labeledInput = new LabeledInputView(this.locale, InputTextView);

        labeledInput.label = t('Internal link');
        labeledInput.inputView.placeholder = t('Enter title or id');

        return labeledInput;
    }

}

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * e.g. click on {@link #saveButtonView}.
 *
 * @event submit
 */

/**
 * Fired when the form view is canceled, e.g. click on {@link #cancelButtonView}.
 *
 * @event cancel
 */
