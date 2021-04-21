import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

// WordPress dependencies
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { sprintf, __ } from '@wordpress/i18n';

import SettingsModal from './settings-modal';
import {
	STORE_KEY_EDIT_POD,
	SAVE_STATUSES,
} from 'dfv/src/store/constants';
import GroupDragLayer from './group-drag-layer';
import FieldGroup from './field-group';

import { GROUP_PROP_TYPE_SHAPE } from 'dfv/src/config/prop-types';

import './field-groups.scss';

const FieldGroups = ( {
	podType,
	podName,
	podID,
	podLabel,
	podSaveStatus,
	groups,
	saveGroup,
	deleteAndRemoveGroup,
	moveGroup,
	resetGroupSaveStatus,
	groupSaveStatuses,
	groupSaveMessages,
	editGroupPod,
} ) => {
	const [ showAddGroupModal, setShowAddGroupModal ] = useState( false );
	const [ addedGroupName, setAddedGroupName ] = useState( null );

	// If there's only one group, expand that group initially.
	const [ expandedGroups, setExpandedGroups ] = useState(
		1 === groups.length ? { [ groups[ 0 ].name ]: true } : {}
	);

	const [ groupsMovedSinceLastSave, setGroupsMovedSinceLastSave ] = useState( {} );

	const handleAddGroup = ( options = {} ) => ( event ) => {
		event.stopPropagation();

		setAddedGroupName( options.name );

		saveGroup(
			podID,
			options.name,
			options.name,
			options.label,
			omit( options, [ 'name', 'label', 'id' ] )
		);
	};

	const toggleExpandGroup = ( groupName ) => ( event ) => {
		event.stopPropagation();
		setExpandedGroups( {
			...expandedGroups,
			[ groupName ]: expandedGroups[ groupName ] ? false : true,
		} );
	};

	const handleGroupMove = ( oldIndex, newIndex ) => {
		moveGroup( oldIndex, newIndex );
	};

	const handleGroupDrop = () => {
		// Mark all groups as being edited
		setGroupsMovedSinceLastSave(
			groups.reduce( ( accumulator, current ) => {
				return {
					...accumulator,
					[ current.name ]: true,
				};
			}, {} )
		);
	};

	// After the pod has been saved, reset the list of groups
	// that haven't been saved.
	useEffect( () => {
		if ( podSaveStatus === SAVE_STATUSES.SAVE_SUCCESS ) {
			setGroupsMovedSinceLastSave( {} );
		}
	}, [ podSaveStatus ] );

	// After a new group has successfully been added, close
	// the modal.
	useEffect( () => {
		if (
			!! addedGroupName &&
			groupSaveStatuses[ addedGroupName ] === SAVE_STATUSES.SAVE_SUCCESS
		) {
			setShowAddGroupModal( false );
			setAddedGroupName( null );
		}
	}, [ addedGroupName, setShowAddGroupModal, groupSaveStatuses ] );

	return (
		<div className="field-groups">
			{ showAddGroupModal && (
				<SettingsModal
					podType={ podType }
					podName={ podName }
					optionsPod={ editGroupPod }
					selectedOptions={ {} }
					title={ sprintf(
						/* translators: %1$s: Pod Label */
						__( '%1$s > Add Group', 'pods' ),
						podLabel,
					) }
					hasSaveError={ groupSaveStatuses[ addedGroupName ] === SAVE_STATUSES.SAVE_ERROR }
					saveButtonText={ __( 'Save New Group', 'pods' ) }
					errorMessage={
						groupSaveMessages[ addedGroupName ] ||
						__( 'There was an error saving the group, please try again.', 'pods' )
					}
					cancelEditing={ () => {
						setShowAddGroupModal( false );
						setAddedGroupName( null );
					} }
					save={ handleAddGroup }
				/>
			) }

			<div className="pods-button-group_container">
				<button
					className="pods-button-group_add-new"
					onClick={ ( event ) => {
						event.target.blur();

						setShowAddGroupModal( true );
					} }
				>
					{ __( '+ Add New Group', 'pods' ) }
				</button>
			</div>

			{ groups.map( ( group, index ) => {
				const hasMoved = !! groupsMovedSinceLastSave[ group.name ];

				return (
					<FieldGroup
						key={ group.name }
						podType={ podType }
						podName={ podName }
						podID={ podID }
						podLabel={ podLabel }
						group={ group }
						index={ index }
						editGroupPod={ editGroupPod }
						deleteGroup={ deleteAndRemoveGroup }
						moveGroup={ handleGroupMove }
						handleGroupDrop={ handleGroupDrop }
						saveStatus={ groupSaveStatuses[ group.name ] }
						saveMessage={ groupSaveMessages[ group.name ] }
						saveGroup={ saveGroup }
						resetGroupSaveStatus={ resetGroupSaveStatus }
						isExpanded={ expandedGroups[ group.name ] || false }
						toggleExpanded={ toggleExpandGroup( group.name ) }
						hasMoved={ hasMoved }
					/>
				);
			} ) }

			<GroupDragLayer />

			<div className="pods-button-group_container">
				<button
					className="pods-button-group_add-new"
					onClick={ () => setShowAddGroupModal( true ) }
				>
					{ __( '+ Add New Group', 'pods' ) }
				</button>
			</div>
		</div>
	);
};

FieldGroups.propTypes = {
	podType: PropTypes.string.isRequired,
	podName: PropTypes.string.isRequired,
	podID: PropTypes.number.isRequired,
	podLabel: PropTypes.string.isRequired,
	podSaveStatus: PropTypes.string.isRequired,
	groups: PropTypes.arrayOf( GROUP_PROP_TYPE_SHAPE ).isRequired,
	deleteAndRemoveGroup: PropTypes.func.isRequired,
	moveGroup: PropTypes.func.isRequired,
	editGroupPod: PropTypes.object.isRequired,
	resetGroupSaveStatus: PropTypes.func.isRequired,
	groupSaveStatuses: PropTypes.object.isRequired,
	groupSaveMessages: PropTypes.object.isRequired,
};

export default compose( [
	withSelect( ( select ) => {
		const storeSelect = select( STORE_KEY_EDIT_POD );

		return {
			podType: storeSelect.getPodOption( 'type' ),
			podName: storeSelect.getPodOption( 'name' ),
			podID: storeSelect.getPodID(),
			podLabel: storeSelect.getPodOption( 'label' ),
			podSaveStatus: storeSelect.getSaveStatus(),
			groups: storeSelect.getGroups(),
			editGroupPod: storeSelect.getGlobalGroupOptions(),
			groupSaveStatuses: storeSelect.getGroupSaveStatuses(),
			groupSaveMessages: storeSelect.getGroupSaveMessages(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const storeDispatch = dispatch( STORE_KEY_EDIT_POD );

		return {
			saveGroup: storeDispatch.saveGroup,
			deleteAndRemoveGroup: ( groupID ) => {
				storeDispatch.deleteGroup( groupID );
				storeDispatch.removeGroup( groupID );
			},
			moveGroup: storeDispatch.moveGroup,
			resetGroupSaveStatus: storeDispatch.resetGroupSaveStatus,
		};
	} ),
] )( FieldGroups );
