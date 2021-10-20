/**
 * @module InternalLink/InternalLinkDataContext
 */

import axios from 'axios';

import { replacePlaceholderInUrl } from '../util/utils';

import {
    CONFIG_TEST_MODE,
    CONFIG_AUTOCOMPLETE_URL,
    CONFIG_TITLE_URL,
    CONFIG_AXIOS_INSTANCE,
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

        return this.getAxiosInstance().get(autocompleteUrl);
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

        return this.getAxiosInstance().get(titleUrl);
    }

    /**
     * Gets the autocomplete test data
     * @param {string} searchTerm The term that is entered into our searchbox
     */
    getAutocompleteTestData(searchTerm) {
        const testData = {
            data: [
                { label: 'SearchTerm: ' + searchTerm, value: '1' },
                { label: 'Vuejs', value: '1001' },
                { label: 'Javascript', value: '500' }
            ]
        };

        return Promise.resolve(testData);
    }

    /**
     * Gets the title test data
     * @param {string} itemId The id of an item you want to load
     */
    getTitleTestData(itemId) {
        let title = 'Item: ' + itemId;

        if (itemId == '500') {
            title = 'Javascript';
        } else if (itemId == '1001') {
            title = 'Vuejs';
        }

        return Promise.resolve({ data: title });
    }

    /**
     * Gets the axios instance
     */
    getAxiosInstance() {
        const customAxiosInstance = this.editor.config.get(CONFIG_AXIOS_INSTANCE);

        if (customAxiosInstance) {
            return customAxiosInstance;
        }

        return axios;
    }

}
