
# ckeditor5-internallink-plugin
A generic ckeditor plugin to create custom html tags containing an identifier to a referenced item.

## Overview
This plugin has the same features as the default link plugin except that it does not create regular link tags.

The HTML-Tags of this plugin are looking as following:

    <internallink internallinkid="123">some text</internallink>
  
## Features

 - Create and edit links
 - Remove links
 - Configurable autocomplete to find the referenceable item
 - Show a label (title) instead of the item id
 - Open the referenced item in a new tab
 - If text is marked the link will be added to it. Otherwise the item title with a link will be added to the text.
 - Configurable webservice urls to get the required data
 - Test mode to test the plugin without having to implement a webservice
 
## Configuration
Configuration flags:

| Flag name | Description | Example |
| --- | --- | --- |
| testmode | If set to true the plugin can be tested without autocompleteurl and titleurl | true or false |
| autocompleteurl | Configure a json webservice that returns the autocomplete suggestions. The placeholder **{searchTerm}** is replaced by the search term that is entered to the autocomplete textbox. | http://www.example.com/autocomplete?term={searchTerm} |
| titleurl | Configure a json webservice that returns the title for a referenced item. This service is called on editing an existing link. The placeholder **{internalLinkId}** is replaced by the id of the referenced item. | http://www.example.com/gettitle?itemid={internalLinkId} |
| previewurl | The url that is used to open a preview of the referenced item in a new tab. The placeholder **{internalLinkId}** is replaced by the id of the referenced item. | http://www.google.de?q={internalLinkId} |

Example:

    InlineEditor
	.create( editorElement, {
		internallink: {
			testmode: false,
			autocompleteurl: '',
			titleurl: '',
			previewurl: ''
		}
	} )
	.then( ... )
	.catch( ... );

## Webservice response data format

This plugin requires webservices that are returning json data.
We are using axios to do HTTP-GET requests.

### Autocomplete response

    [
	    { label:  'Text1', value:  '1' },
	    { label:  'Text2', value:  '2' }
	]

### Get title response

Returns a string with the title

## License

ckeditor5-internallink-plugin is released under the MIT License. See LICENSE file for details.
