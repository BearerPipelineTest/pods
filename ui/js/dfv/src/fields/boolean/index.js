import React from 'react';

import Pick from '../pick';

import { toNumericBool } from 'dfv/src/helpers/booleans';
import {
	BOOLEAN_ALL_TYPES_OR_EMPTY,
	FIELD_COMPONENT_BASE_PROPS,
} from 'dfv/src/config/prop-types';

const Boolean = ( props ) => {
	const {
		fieldConfig = {},
		setValue,
		value,
	} = props;

	const {
		boolean_format_type: formatType = 'checkbox', // 'checkbox', 'radio', or 'dropdown'
		boolean_no_label: noLabel = 'No',
		boolean_yes_label: yesLabel = 'Yes',
	} = fieldConfig;

	const options = [ { value: '1', label: yesLabel } ];

	if ( 'checkbox' !== formatType ) {
		options.push( { value: '0', label: noLabel } );
	}

	return (
		<Pick
			{ ...props }
			fieldConfig={ {
				...fieldConfig,
				pick_format_type: 'single',
				pick_format_single: formatType,
				data: options,
			} }
			value={ toNumericBool( value ) }
			setValue={ setValue }
		/>
	);
};

Boolean.propTypes = {
	...FIELD_COMPONENT_BASE_PROPS,
	value: BOOLEAN_ALL_TYPES_OR_EMPTY,
};

export default Boolean;
