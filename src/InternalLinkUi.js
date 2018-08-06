/**
 * @module InternalLink/InternalLinkUi
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';

import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import InternalLinkFormView from './ui/internalLinkFormView';
import InternalLinkActionsView from './ui/internalLinkActionsView';

import LinkIcon from '../theme/icons/link.svg';

import { createButton } from './ui/uiUtils';
import { isLinkElement } from './utils';

import {
    PROPERTY_INTERNAL_LINK_ID,
    PROPERTY_TITLE,
    PROPERTY_VALUE,
    COMMAND_LINK,
    COMMAND_UNLINK,
    BUTTON_LINK } from './constants';

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
         * @member {module:InternalLink/ui/internalInternalLinkActionsView~InternalInternalLinkActionsView}
         */
        this.actionsView = this.createActionsView();

        /**
         * The form view displayed inside the balloon.
         *
         * @member {module:InternalLink/ui/internalInternalLinkFormView~InternalInternalLinkFormView}
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

        // Attach lifecycle actions to the the balloon.
        this.enableUserBalloonInteractions();
    }

    /**
     * Creates a toolbar Link button. Clicking this button will show
     * a {@link #balloon} attached to the selection.
     *
     * @private
     */
    createToolbarButton() {
        const editor = this.editor;
        const linkCommand = editor.commands.get(COMMAND_LINK);
        const t = editor.t;

        editor.ui.componentFactory.add(BUTTON_LINK, locale => {
            const button = createButton(t('Internal link'), LinkIcon, locale);
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
        const editor = this.editor;
        const linkCommand = editor.commands.get(COMMAND_LINK);

        if (!linkCommand.isEnabled) {
            return;
        }

        // When there's no link under the selection, go straight to the editing UI.
        if (!this.getSelectedLinkElement()) {
            this.addActionsView();
            this.addFormView();
        }
        // If theres a link under the selection...
        else {
            // Go to the editing UI if actions are already visible.
            if (this.areActionsVisible) {
                this.addFormView();
            }
            // Otherwise display just the actions UI.
            else {
                this.addActionsView();
            }
        }

        // Begin responding to ui#update once the UI is added.
        this.startUpdatingUI();
    }

    /**
     * Removes the {@link #formView} from the {@link #_alloon}.
     *
     * See {@link #addFormView}, {@link #addActionsView}.
     *
     * @protected
     */
    hideUI() {
        if (!this.isBalloonInitialized) {
            return;
        }

        const editor = this.editor;

        this.stopListening(editor.ui, 'update');

        // Remove form first because it's on top of the stack.
        this.removeFormView();

        // Then remove the actions view because it's beneath the form.
        this.balloon.remove(this.actionsView);

        // Make sure the focus always gets back to the editable.
        editor.editing.view.focus();
    }

    /**
     * Makes the UI react to the {@link module:core/editor/editorui~EditorUI#event:update} event to
     * reposition itself when the editor ui should be refreshed.
     *
     * See: {@link #hideUI} to learn when the UI stops reacting to the `update` event.
     *
     * @protected
     */
    startUpdatingUI() {
        const editor = this.editor;

        let prevSelectedLink = this.getSelectedLinkElement();
        let prevSelectionParent = this.getSelectionParent();

        this.listenTo(editor.ui, 'update', () => {
            const selectedLink = this.getSelectedLinkElement();
            const selectionParent = this.getSelectionParent();

            // Hide the panel if:
            //
            // * the selection went out of the EXISTING link element. E.g. user moved the caret out
            //   of the link,
            // * the selection went to a different parent when creating a NEW link. E.g. someone
            //   else modified the document.
            // * the selection has expanded (e.g. displaying link actions then pressing SHIFT+Right arrow).
            //
            // Note: #_getSelectedLinkElement will return a link for a non-collapsed selection only
            // when fully selected.
            if ((prevSelectedLink && !selectedLink)
                || (!prevSelectedLink && selectionParent !== prevSelectionParent)) {
                this.hideUI();
            }
            // Update the position of the panel when:
            //  * the selection remains in the original link element,
            //  * there was no link element in the first place, i.e. creating a new link
            else {
                // If still in a link element, simply update the position of the balloon.
                // If there was no link (e.g. inserting one), the balloon must be moved
                // to the new position in the editing view (a new native DOM range).
                this.balloon.updatePosition(this.getBalloonPositionData());
            }

            prevSelectedLink = selectedLink;
            prevSelectionParent = selectionParent;
        });
    }

    /**
     * Gets the selected parent element.
     *
     * @protected
     */
    getSelectionParent() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;

        return viewDocument.selection.focus.getAncestors()
            .reverse()
            .find(node => node.is('element'));
    }

    /**
     * Creates the {@link module:internalLink/ui/internalInternalLinkFormView~InternalInternalLinkFormView} instance.
     *
     * @private
     * @returns {module:internalLink/ui/internalInternalLinkFormView~InternalInternalLinkFormView} The link form instance.
     */
    createFormView() {
        const editor = this.editor;
        const formView = new InternalLinkFormView(editor);
        const linkCommand = editor.commands.get(COMMAND_LINK);

        formView.bind(PROPERTY_INTERNAL_LINK_ID).to(linkCommand, PROPERTY_VALUE);
        formView.bind(PROPERTY_TITLE).to(linkCommand, PROPERTY_TITLE);

        // Form elements should be read-only when corresponding commands are disabled.
        formView.idInputView.bind('isReadOnly').to(linkCommand, 'isEnabled', value => !value);

        // Execute link command after clicking the "Save" button.
        this.listenTo(formView, 'submit', () => {
            editor.execute(
                COMMAND_LINK,
                formView.idInputView.inputView.element.value,
                formView.titleLabelView.text);

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

    /**
     * Creates the {@link module:internalLink/ui/internallinkactionsview~InternalLinkActionsView} instance.
     *
     * @private
     * @returns {module:link/ui/linkactionsview~LinkActionsView} The link actions view instance.
     */
    createActionsView() {
        const editor = this.editor;
        const actionsView = new InternalLinkActionsView(editor);
        const linkCommand = editor.commands.get(COMMAND_LINK);
        const unlinkCommand = editor.commands.get(COMMAND_UNLINK);

        actionsView.bind(PROPERTY_INTERNAL_LINK_ID).to(linkCommand, PROPERTY_VALUE);
        actionsView.bind(PROPERTY_TITLE).to(linkCommand, PROPERTY_TITLE);

        actionsView.editButtonView.bind('isEnabled').to(linkCommand, 'isEnabled');
        actionsView.unlinkButtonView.bind('isEnabled').to(unlinkCommand, 'isEnabled');

        // Execute action to show the form after clicking on the "Edit" button.
        this.listenTo(actionsView, 'edit', () => {
            this.addFormView();
        });

        // Execute unlink command after clicking on the "Unlink" button.
        this.listenTo(actionsView, 'unlink', () => {
            editor.execute(COMMAND_UNLINK);
            this.hideUI();
        });

        // Close the panel on esc key press when the **actions have focus**.
        actionsView.keystrokes.set('Esc', (data, cancel) => {
            this.hideUI();
            cancel();
        });

        return actionsView;
    }

    /**
     * Returns true when {@link #formView} is in the {@link #balloon}.
     *
     * @readonly
     * @protected
     * @type {Boolean}
     */
    get isBalloonInitializedWithForm() {
        return this.balloon.hasView(this.formView);
    }

    /**
     * Returns true when {@link #actionsView} is in the {@link #balloon}.
     *
     * @readonly
     * @protected
     * @type {Boolean}
     */
    get isBalloonInitializedWithActions() {
        return this.balloon.hasView(this.actionsView);
    }

    /**
     * Returns true when {@link #actionsView} is in the {@link #balloon} and it is
     * currently visible.
     *
     * @readonly
     * @protected
     * @type {Boolean}
     */
    get areActionsVisible() {
        return this.balloon.visibleView === this.actionsView;
    }

    /**
	 * Returns true when {@link #actionsView} or {@link #formView} is in the {@link #balloon} and it is
	 * currently visible.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
    get isUIVisible() {
        return this.balloon.visibleView == this.formView || this.areActionsVisible;
    }

    /**
	 * Returns true when {@link #actionsView} or {@link #formView} is in the {@link #balloon}.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
    get isBalloonInitialized() {
        return this.isBalloonInitializedWithForm || this.isBalloonInitializedWithActions;
    }

    /**
     * Adds the {@link #actionsView} to the {@link #balloon}.
     *
     * @protected
     */
    addActionsView() {
        // Do nothing if the actions are visible already.
        if (this.isBalloonInitializedWithActions) {
            return;
        }

        this.balloon.add({
            view: this.actionsView,
            position: this.getBalloonPositionData()
        });
    }

    /**
 * Adds the {@link #formView} to the {@link #balloon}.
 *
 * @protected
 */
    addFormView() {
        if (this.isBalloonInitializedWithForm) {
            return;
        }

        const editor = this.editor;
        const linkCommand = editor.commands.get(COMMAND_LINK);

        this.balloon.add({
            view: this.formView,
            position: this.getBalloonPositionData()
        });

        this.formView.idInputView.select();

        // Make sure that each time the panel shows up, the URL field remains in sync with the value of
        // the command. If the user typed in the input, then canceled the balloon (`idInputView#value` stays
        // unaltered) and re-opened it without changing the value of the link command (e.g. because they
        // clicked the same link), they would see the old value instead of the actual value of the command.
        // https://github.com/ckeditor/ckeditor5-link/issues/78
        // https://github.com/ckeditor/ckeditor5-link/issues/123
        this.formView.idInputView.inputView.element.value = linkCommand.value || '';
        this.formView.titleLabelView.text = linkCommand.title || '';
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

    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} is visible or not.
     *
     * @private
     */
    enableUserBalloonInteractions() {
        const viewDocument = this.editor.editing.view.document;

        // Handle click on view document and show panel when selection is placed inside the link element.
        // Keep panel open until selection will be inside the same link element.
        this.listenTo(viewDocument, 'click', () => {
            const parentLink = this.getSelectedLinkElement();

            if (parentLink) {
                // Then show panel but keep focus inside editor editable.
                this.showUi();
            }
        });

        // Focus the form if the balloon is visible and the Tab key has been pressed.
        this.editor.keystrokes.set('Tab', (data, cancel) => {
            if (this.areActionsVisible && !this.actionsView.focusTracker.isFocused) {
                this.actionsView.focus();
                cancel();
            }
        }, {
            // Use the high priority because the link UI navigation is more important
            // than other feature's actions, e.g. list indentation.
            // https://github.com/ckeditor/ckeditor5-link/issues/146
            priority: 'high'
        });

        // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
        this.editor.keystrokes.set('Esc', (data, cancel) => {
            if (this.isUIVisible) {
                this.hideUI();
                cancel();
            }
        });

        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: this.formView,
            activator: () => this.isUIVisible,
            contextElements: [this.balloon.view.element],
            callback: () => this.hideUI()
        });
    }

    /**
     * Returns positioning options for the {@link #balloon}. They control the way the balloon is attached
     * to the target element or selection.
     *
     * If the selection is collapsed and inside a link element, the panel will be attached to the
     * entire link element. Otherwise, it will be attached to the selection.
     *
     * @private
     * @returns {module:utils/dom/position~Options}
     */
    getBalloonPositionData() {
        const view = this.editor.editing.view;
        const viewDocument = view.document;
        const targetLink = this.getSelectedLinkElement();

        const target = targetLink
            // When selection is inside link element, then attach panel to this element.
            ? view.domConverter.mapViewToDom(targetLink)
            // Otherwise attach panel to the selection.
            : view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());

        return { target };
    }

    /**
     * Returns the link {@link module:engine/view/attributeelement~AttributeElement} under
     * the {@link module:engine/view/document~Document editing view's} selection or `null`
     * if there is none.
     *
     * **Note**: For a non–collapsed selection the link element is only returned when **fully**
     * selected and the **only** element within the selection boundaries.
     *
     * @private
     * @returns {module:engine/view/attributeelement~AttributeElement|null}
     */
    getSelectedLinkElement() {
        const selection = this.editor.editing.view.document.selection;

        if (selection.isCollapsed) {
            return this.findLinkElementAncestor(selection.getFirstPosition());
        } else {
            // The range for fully selected link is usually anchored in adjacent text nodes.
            // Trim it to get closer to the actual link element.
            const range = selection.getFirstRange().getTrimmed();
            const startLink = this.findLinkElementAncestor(range.start);
            const endLink = this.findLinkElementAncestor(range.end);

            if (!startLink || startLink != endLink) {
                return null;
            }

            // Check if the link element is fully selected.
            if (Range.createIn(startLink).getTrimmed().isEqual(range)) {
                return startLink;
            } else {
                return null;
            }
        }
    }

    /**
     * Gets the anchestor of a link element.
     *
     * @param {*} position A position
     */
    findLinkElementAncestor(position) {
        return position.getAncestors().find(ancestor => isLinkElement(ancestor));
    }

}
