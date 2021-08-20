import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Pods dependencies
 */
import FieldWrapper from 'dfv/src/components/field-wrapper';
import { FIELD_PROP_TYPE_SHAPE } from 'dfv/src/config/prop-types';

const FieldSet = ( {
	fields,
	allPodFields,
	allPodValues,
	setOptionValue,
} ) => {
	// Only calculate this once - this assumes that the array of all fields
	// for the Pod does not change, to save render time.
	const allPodFieldsMap = useMemo( () => {
		return new Map(
			allPodFields.map( ( fieldData ) => [ fieldData.name, fieldData ] )
		);
	}, [] );

	return fields.map( ( field ) => {
		const {
			type,
			name,
			boolean_group: booleanGroup,
		} = field;

		// Boolean Group fields get a map of values instead of a single value.
		const isGroupField = 'boolean_group' === type;

		const values = {};

		if ( isGroupField ) {
			( booleanGroup || [] ).forEach( ( subField ) => {
				values[ subField.name ] = subField.name
					? allPodValues[ subField.name ]
					: undefined;
			} );
		}

		return (
			<FieldWrapper
				key={ name }
				field={ field }
				value={ isGroupField ? undefined : allPodValues[ name ] }
				values={ isGroupField ? values : undefined }
				setOptionValue={ setOptionValue }
				allPodFieldsMap={ allPodFieldsMap }
				allPodValues={ allPodValues }
			/>
		);
	} );
};

FieldSet.propTypes = {
	/**
	 * Array of fields that should be rendered in the set.
	 */
	fields: PropTypes.arrayOf( FIELD_PROP_TYPE_SHAPE ).isRequired,

	/**
	 * All fields from the Pod, including ones that belong to other groups.
	 */
	allPodFields: PropTypes.arrayOf( FIELD_PROP_TYPE_SHAPE ).isRequired,

	/**
	 * A map object with all of the Pod's current values.
	 */
	allPodValues: PropTypes.object.isRequired,

	/**
	 * Function to update the field's value on change.
	 */
	setOptionValue: PropTypes.func.isRequired,
};

export default FieldSet;