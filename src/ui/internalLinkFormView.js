/**
 * @module internalLink/ui/InternalLinkFormView
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import { createButton, createFocusCycler, registerFocusableViews } from './uiutils';
import delayKeyUp from 'delay-keyup';

import Awesomplete from 'awesomplete';
import InternalLinkDataContext from '../data/internalLinkDataContext';

import { PROPERTY_INTERNAL_LINK_ID,
    PROPERTY_TITLE
} from '../util/constants';

import '../../theme/internallinkform.css';

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
    constructor(editor) {
        super(editor.locale);

        const t = this.locale.t;

        /**
         * Value of the "internalLinkId" attribute of the link to use in the {@link #previewButtonView}.
         *
         * @observable
         * @member {String}
         */
        this.set(PROPERTY_INTERNAL_LINK_ID);

        /**
         * Value of the "title" attribute of the link to use in the {@link #previewButtonView}.
         *
         * @observable
         * @member {String}
         */
        this.set(PROPERTY_TITLE);

        /**
         * Used for accessing web services to load the link data.
         *
         * @readonly
         * @protected
         * @member {module:InternalLink/InternalLinkDataContext}
         */
        this.dataContext = new InternalLinkDataContext(editor);

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
         * The description to a selected id.
         *
         * @member {module:ui/label/labelview~LabelView}
         */
        this.titleLabelView = this.createTitleLabel();

        /**
         * The Save button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        this.saveButtonView = createButton(t('Save'), checkIcon, this.locale, 'ck-button-save');
        this.saveButtonView.type = 'submit';
        this.saveButtonView.bind('isEnabled').to(this.titleLabelView, 'text');

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
                this.cancelButtonView,
                this.titleLabelView
            ]
        });
    }

    /**
     * @inheritDoc
     */
    render() {
        super.render();

        this.initAutocomplete();

        submitHandler({
            view: this
        });

        const childViews = [
            this.idInputView,
            this.saveButtonView,
            this.cancelButtonView,
            this.titleLabelView
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
        labeledInput.inputView.placeholder = t('Enter title');
        labeledInput.bind('value').to(this, PROPERTY_INTERNAL_LINK_ID);

        return labeledInput;
    }

    /**
     * Creates the label to a selected id.
     *
     * @private
     * @returns {module:ui/label/labelview~LabelView} Labele view instance.
     */
    createTitleLabel() {
        const label = new LabelView(this.locale);
        label.bind('text').to(this, PROPERTY_TITLE);
        return label;
    }

    initAutocomplete() {
        if (this.autocomplete) {
            return;
        }

        this.autocomplete = new Awesomplete(this.idInputView.inputView.element, {
            list: [],
            filter() {
                // Dont filter client side. The web service returns the data that should be shown only.
                return true;
            }
        });

        delayKeyUp(
            this.idInputView.inputView.element,
            this.loadAutocompleteData.bind(this),
            500);

        this.idInputView.inputView.element.addEventListener('awesomplete-selectcomplete', function(event) {
            this.titleLabelView.text = event.text.label;
        }.bind(this));

    }

    loadAutocompleteData() {
        this.titleLabelView.text = '';
        this.dataContext.getAutocompleteItems(this.idInputView.inputView.element.value)
            .then(response => {
                this.autocomplete.list = response.data;
            });
    }

    /**
     * @inheritDoc
     */
    destroy() {
        if (this.autocomplete) {
            this.autocomplete.destroy();
        }
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
