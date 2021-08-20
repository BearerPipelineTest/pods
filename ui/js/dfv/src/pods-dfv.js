/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Pods dependencies
 */
import {
	initPodStore,
	initEditPodStore,
} from 'dfv/src/store/store';
import PodsDFVApp from 'dfv/src/core/pods-dfv-app';
import { PodsGbModalListener } from 'dfv/src/core/gb-modal-listener';
import * as models from 'dfv/src/config/model-manifest';

import FIELD_MAP from 'dfv/src/fields/field-map';

// Loads data from an object in this script tag.
const SCRIPT_TARGET = 'script.pods-dfv-field-data';

window.PodsDFV = {
	models,
	dfvRootContainer: null,

	/**
	 * Initialize Pod data.
	 */
	init() {
		// Find all in-line data scripts
		const dataTags = [ ...document.querySelectorAll( SCRIPT_TARGET ) ];

		const fieldsData = dataTags.map( ( tag ) => {
			const data = JSON.parse( tag.innerHTML );

			// Ignore anything malformed or that doesn't have the field type set
			if ( ! data?.fieldType ) {
				return undefined;
			}

			// Some fields are rendered directly, most are not.
			const directRender = FIELD_MAP[ data.fieldType ]?.directRender || false;

			// Clean up the field config.
			// Includes a kludge to disable the "Add New" button if we're inside a media modal.  This should
			// eventually be ironed out so we can use Add New from this context (see #4864)
			const cleanedFieldConfig = omit(
				( data.fieldConfig || {} ),
				[ '_field_object', 'output_options', 'item_id' ]
			);

			if ( tag.closest( '.media-modal-content' ) ) {
				if ( cleanedFieldConfig.fieldConfig ) {
					cleanedFieldConfig.fieldConfig.pick_allow_add_new = '0';
				} else {
					cleanedFieldConfig.pick_allow_add_new = '0';
				}
			}

			// Move other data into the field config so we have less to pass around.
			cleanedFieldConfig.htmlAttr = data.htmlAttr || {};
			cleanedFieldConfig.fieldEmbed = data.fieldEmbed || false;

			if ( data.fieldItemData ) {
				cleanedFieldConfig.fieldItemData = data.fieldItemData;
			}

			return {
				directRender,
				fieldComponent: FIELD_MAP[ data.fieldType ]?.fieldComponent || null,
				parentNode: tag.parentNode,
				fieldConfig: directRender ? undefined : cleanedFieldConfig,
				fieldItemData: data.fieldItemData || null,
				fieldValue: data.fieldValue || null,
			};
		} );

		// Filter out any that we skipped.
		const validFieldsData = fieldsData.filter( ( fieldData ) => !! fieldData );

		// Create the store if it hasn't been done already.
		// The initial values for the data store require some massaging:
		// Some are arrays when we need single values (this may change once
		// repeatable fields are implemented), others have special requirements.
		const initialValues = validFieldsData.reduce(
			( accumulator, currentField ) => {
				const fieldConfig = currentField.fieldConfig || {};

				// "Boolean Group" fields are actually comprised of other fields with their own
				// named values, so instead of just one key/value, they'll have multiple ones.
				// These are handled very differently, so process them and return early.
				if ( 'boolean_group' === fieldConfig.type ) {
					const values = {};

					fieldConfig.boolean_group.forEach( ( groupItem ) => {
						if ( ! groupItem.name || 'undefined' === typeof groupItem.default ) {
							return;
						}

						values[ groupItem.name ] = currentField.fieldItemData?.[ groupItem.name ] ||
							groupItem.default ||
							'';
					} );

					return {
						...accumulator,
						...values,
					};
				}

				// Look up the value based on either the fieldValue, or any of the ways
				// that the default value could be set.
				const searchParams = new URLSearchParams( window.location.search );
				let value;

				if ( 'undefined' !== typeof currentField.fieldValue ) {
					value = currentField.fieldValue;
				} else if (
					'undefined' !== currentField.default_value_parameter &&
					'undefined' !== searchParams &&
					'undefined' !== searchParams.get( currentField.default_value_parameter )
				) {
					value = searchParams.get( currentField.default_value_parameter );
				} else if ( 'undefined' !== typeof currentField.default ) {
					value = currentField.default;
				} else if ( 'undefined' !== typeof currentField.default_value ) {
					value = currentField.default_value;
				} else {
					value = '';
				}

				return {
					...accumulator,
					[ fieldConfig.name ]: value,
				};
			},
			{}
		);

		console.log( 'initialValues', initialValues );

		// The Edit Pod screen gets a different store set up than
		// other contexts.
		if ( window.podsAdminConfig ) {
			initEditPodStore( window.podsAdminConfig );
		} else if ( window.podsDFVConfig ) {
			initPodStore( window.podsDFVConfig, initialValues );
		} else {
			// Something is wrong if neither set of globals is set.
			return;
		}

		// Creates a container for the React app to "render",
		// although it doesn't actually render anything in the container,
		// but places the fields in the correct places with Portals.
		if ( ! this.dfvRootContainer ) {
			this.dfvRootContainer = document.createElement( 'div' );
			this.dfvRootContainer.id = 'pods-dfv-container';
			document.body.appendChild( this.dfvRootContainer );
		}

		// Set up the DFV app.
		ReactDOM.render(
			<PodsDFVApp fieldsData={ validFieldsData } />,
			this.dfvRootContainer
		);
	},

	isMediaModal() {
		return window.location.pathname === '/wp-admin/upload.php';
	},

	isModalWindow() {
		return ( -1 !== location.search.indexOf( 'pods_modal=' ) );
	},

	isGutenbergEditorLoaded() {
		return ( select( 'core/editor' ) !== undefined );
	},
};

/**
 * Kick everything off on DOMContentLoaded
 */
document.addEventListener( 'DOMContentLoaded', () => {
	// For the Media context, init gets called later.
	if ( window.PodsDFV.isMediaModal() ) {
		return;
	}

	window.PodsDFV.init();
} );

// Load the Gutenberg modal listener if we're inside a Pods modal with Gutenberg active
const LoadModalListeners = () => {
	useEffect( () => {
		if ( window.PodsDFV.isModalWindow() && window.PodsDFV.isGutenbergEditorLoaded() ) {
			PodsGbModalListener.init();
		}
	}, [] );

	return null;
};

registerPlugin( 'pods-load-modal-listeners', {
	render: LoadModalListeners,
} );
