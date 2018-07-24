'use strict';

module.exports = {
    extends: 'ckeditor5',
    rules: {
        'linebreak-style': [
            'error',
            'windows'
        ],
        'indent': [
            'error',
            4
        ],
        'array-bracket-spacing': [
            'error',
            'never'
        ],
        'padded-blocks': [
            'error',
            {
                'classes': 'always'
            }
        ],
        'space-in-parens': [
            'error',
            'never'
        ]
    }
};
