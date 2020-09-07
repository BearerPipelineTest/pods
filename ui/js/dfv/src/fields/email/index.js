import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import BaseInput from 'dfv/src/fields/base-input';
import { emailValidator } from 'dfv/src/helpers/validators';
import { toBool } from 'dfv/src/helpers/booleans';

import { FIELD_PROP_TYPE_SHAPE } from 'dfv/src/config/prop-types';

const Email = ( props ) => {
	const {
		addValidationRules,
		fieldConfig = {},
	} = props;

	const {
		email_max_length: maxLength,
		email_placeholder: placeholder,
		email_html5: html5,
	} = fieldConfig;

	useEffect( () => {
		const emailValidationRule = {
			rule: emailValidator(),
			condition: () => true,
		};

		addValidationRules( [ emailValidationRule ] );
	}, [] );

	return (
		<BaseInput
			fieldConfig={ fieldConfig }
			type={ true === toBool( html5 ) ? 'email' : 'text' }
			maxLength={ maxLength }
			placeholder={ placeholder }
			{ ...props }
		/>
	);
};

Email.propTypes = {
	addValidationRules: PropTypes.func.isRequired,
	fieldConfig: FIELD_PROP_TYPE_SHAPE,
	setValue: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
};

export default Email;
