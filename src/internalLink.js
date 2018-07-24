import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class internalLink extends Plugin {

    static get requires() {
        return [];
    }

    static get pluginName() {
        return 'internalLink';
    }

}
