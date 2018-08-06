/**
 * @module InternalLink/InternalLinkDataContext
 */

// import axios from 'axios';

import { replacePlaceholderInUrl } from '../util/utils';

import {
    CONFIG_TEST_MODE,
    CONFIG_AUTOCOMPLETE_URL,
    CONFIG_TITLE_URL,
    URL_PLACEHOLDER_ID,
    URL_PLACEHOLDER_SEARCH_TERM
} from '../util/constants';

/**
 * This is used to call a web service for finding
 * items and getting the item name by id.
 */
export default class InternalLinkDataContext {

    constructor(editor) {
        this.editor = editor;
    }

    /**
     * Gets the autocomplete suggestions
     * @param {string} searchTerm The term that is entered into our search box
     */
    getAutocompleteItems(searchTerm) {
        const isTestMode = this.editor.config.get(CONFIG_TEST_MODE);
        const url = this.editor.config.get(CONFIG_AUTOCOMPLETE_URL);
        const autocompleteUrl = replacePlaceholderInUrl(url, URL_PLACEHOLDER_SEARCH_TERM, searchTerm);

        if (isTestMode) {
            return this.getAutocompleteTestData(searchTerm);
        }

        console.log(autocompleteUrl); // eslint-disable-line
    }

    /**
     * Loads the title of an item
     * @param {string} itemId The id of an item you want to load
     */
    getTitleById(itemId) {
        const isTestMode = this.editor.config.get(CONFIG_TEST_MODE);
        const url = this.editor.config.get(CONFIG_TITLE_URL);
        const titleUrl = replacePlaceholderInUrl(url, URL_PLACEHOLDER_ID, itemId);

        if (isTestMode) {
            return this.getTitleTestData(itemId);
        }

        console.log(titleUrl); // eslint-disable-line
    }

    /**
     * Gets the autocomplete test data
     * @param {string} searchTerm The term that is entered into our searchbox
     */
    getAutocompleteTestData(searchTerm) {
        return [
            { label: 'SearchTerm: ' + searchTerm, value: '1' },
            { label: 'Vuejs', value: '1001' },
            { label: 'Javascript', value: '500' }];
    }

    /**
     * Gets the title test data
     * @param {string} itemId The id of an item you want to load
     */
    getTitleTestData(itemId) {
        if (itemId == '500') {
            return 'Javascript';
        } else if (itemId == '1001') {
            return 'Vuejs';
        } else {
            return 'Item: ' + itemId;
        }
    }

}
