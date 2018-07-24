/**
 * @module InternalLink/InternalLinkUi
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';

import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import LinkFormView from './ui/internalLinkFormView';

import LinkIcon from '../theme/icons/link.svg';

import { createButton } from './ui/uiUtils';

export default class InternalLinkUi extends Plugin {

    /**
     * @inheritDoc
     */
    static get requires() {
        return [ContextualBalloon];
    }

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;

        // Note that this observer is not available by default.
        // See: https://docs.ckeditor.com/ckeditor5/latest/api/module_engine_view_observer_clickobserver-ClickObserver.html
        editor.editing.view.addObserver(ClickObserver);

        /**
         * The actions view displayed inside of the balloon.
         *
         * @member {module:InternalLink/ui/internalLinkactionsview~InternalLinkActionsView}
         */
        this.actionsView = this.createActionsView();

        /**
         * The form view displayed inside the balloon.
         *
         * @member {module:InternalLink/ui/internalLinkformview~InternalLinkFormView}
         */
        this.formView = this.createFormView();

        /**
         * The contextual balloon plugin instance.
         *
         * @private
         * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
         */
        this.balloon = editor.plugins.get(ContextualBalloon);

        this.createToolbarButton();
    }

    /**
     * Creates a toolbar Link button. Clicking this button will show
     * a {@link #_balloon} attached to the selection.
     *
     * @private
     */
    createToolbarButton() {
        const editor = this.editor;
        const linkCommand = editor.commands.get('internalLink');
        const t = editor.t;

        editor.ui.componentFactory.add('internalLink', locale => {
            const button = createButton(t('Link'), LinkIcon, locale);
            button.isEnabled = true;

            // Disables the button if the link command is not enabled
            button.bind('isEnabled').to(linkCommand, 'isEnabled');

            // Show the panel on button click.
            this.listenTo(button, 'execute', () => {
                this.showUi();

                // Always set the focus back to the editing view --> this is a best practice of ckeditor
                this.editor.editing.view.focus();
            });

            return button;
        });
    }

    /**
     * Shows the right kind of the UI for current state of the command. It's either
     * {@link #formView} or {@link #actionsView}.
     *
     * @private
     */
    showUi() {
        // Todo: Switch to correct ui depending on isBalloonInitializedWithForm or isBalloonInitializedWithActions
        this.addFormView();
    }

    /**
     * Creates the {@link module:internalLink/ui/internalLinkFormView~InternalLinkFormView} instance.
     *
     * @private
     * @returns {module:internalLink/ui/internalLinkFormView~InternalLinkFormView} The link form instance.
     */
    createFormView() {
        const editor = this.editor;
        const formView = new LinkFormView(editor.locale);
        const linkCommand = editor.commands.get('internalLink');

        formView.idInputView.bind('value').to(linkCommand, 'value');

        // Form elements should be read-only when corresponding commands are disabled.
        formView.urlInputView.bind('isReadOnly').to(linkCommand, 'isEnabled', value => !value);
        formView.saveButtonView.bind('isEnabled').to(linkCommand);

        // Execute link command after clicking the "Save" button.
        this.listenTo(formView, 'submit', () => {
            editor.execute('internalLink', formView.idInputView.inputView.element.value);
            this.removeFormView();
        });

        // Hide the panel after clicking the "Cancel" button.
        this.listenTo(formView, 'cancel', () => {
            this.removeFormView();
        });

        // Close the panel on esc key press when the **form has focus**.
        formView.keystrokes.set('Esc', (data, cancel) => {
            this.removeFormView();
            cancel();
        });

        return formView;
    }

    createActionsView() {

    }

    /**
     * Returns true when {@link #formView} is in the {@link #_balloon}.
     *
     * @readonly
     * @protected
     * @type {Boolean}
     */
    get isBalloonInitializedWithForm() {
        return this.balloon.hasView(this.formView);
    }

    /**
     * Returns true when {@link #actionsView} is in the {@link #_balloon}.
     *
     * @readonly
     * @protected
     * @type {Boolean}
     */
    get isBalloonInitializedWithActions() {
        return this.balloon.hasView(this.actionsView);
    }

    /**
     * Removes the {@link #formView} from the {@link #balloon}.
     *
     * @protected
     */
    removeFormView() {
        if (this.isBalloonInitializedWithForm) {
            this.balloon.remove(this.formView);

            // Because the form has an input which has focus, the focus must be brought back
            // to the editor. Otherwise, it would be lost.
            this.editor.editing.view.focus();
        }
    }

}
