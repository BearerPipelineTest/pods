<?php
namespace Pods_Unit_Tests;

use PodsField_DateTime;

require_once PODS_TEST_PLUGIN_DIR . '/classes/fields/datetime.php';

/**
 * Class Test_PodsField_Boolean
 *
 * @package            Pods_Unit_Tests
 * @group              pods-field
 * @coversDefaultClass PodsField_DateTime
 */
class Test_PodsField_DateTime extends Pods_UnitTestCase {

	private $field;

	/**
	 * Default date format: mdy (m/d/Y)
	 * Default time type: 12h
	 * Default time format: h_mma (g:ia)
	 */
	public $defaultOptions = array(
		'datetime_type'                  => 'format',
		'datetime_format_custom'         => '',
		'datetime_format_custom_js'      => '',
		'datetime_format'                => 'mdy',
		'datetime_time_type'             => '12',
		'datetime_time_format_custom'    => '',
		'datetime_time_format_custom_js' => '',
		'datetime_time_format'           => 'h_mma',
		'datetime_time_format_24'        => 'hh_mm',
		'datetime_allow_empty'           => 1,
	);

	public function setUp() {

		$this->field = new PodsField_DateTime();
	}

	public function tearDown() {

		unset( $this->field );
	}

	/**
	 * @dataProvider displayDefaultProvider
	 */
	public function test_display_default( $value, $expected ) {
		$options = $this->defaultOptions;

		$this->assertEquals( $expected, $this->field->display( $value, null, $options ) );
	}

	public function displayDefaultProvider() {

		return array(
			array( '2017-12-06'         , '12/06/2017 12:00am' ),
			array( '2017-12-06 15:04'   , '12/06/2017 3:04pm' ),
			array( '2017-12-06 15:04:50', '12/06/2017 3:04pm' ),
			array( '2017-06-12 15:04:50', '06/12/2017 3:04pm' ),
		);
	}

	/**
	 * @dataProvider displayCustomFormatDMYProvider
	 */
	public function test_display_custom_format_dmy( $value, $expected ) {
		$options = $this->defaultOptions;

		$options['datetime_type']          = 'custom';
		$options['datetime_format_custom'] = 'd/m/Y'; // Days and months switched.

		$this->assertEquals( $expected, $this->field->display( $value, null, $options ) );
	}

	public function displayCustomFormatDMYProvider() {

		return array(
			array( '2017-12-06'         , '06/12/2017 12:00am' ),
			array( '2017-12-06 15:04'   , '06/12/2017 3:04pm' ),
			array( '2017-12-06 15:04:50', '06/12/2017 3:04pm' ),
			array( '2017-06-12 15:04:50', '12/06/2017 3:04pm' ),
		);
	}

	/**
	 * @dataProvider saveDefaultsProvider
	 */
	public function test_save_defaults( $value, $expected ) {
		$options = $this->defaultOptions;

		$this->assertEquals( $expected, $this->field->pre_save( $value, null, null, $options ) );
	}

	public function saveDefaultsProvider() {

		return array(
			array( '2017-12-06'         , '2017-12-06 00:00:00' ),
			array( '2017-12-06 15:04'   , '2017-12-06 15:04:00' ),
			array( '2017-12-06 15:04:50', '2017-12-06 15:04:50' ),
			array( '2017-06-12 15:04:50', '2017-06-12 15:04:50' ),
			// Display format.
			array( '12/06/2017 12:00am' , '2017-12-06 00:00:00' ),
			array( '12/06/2017 3:04pm'  , '2017-12-06 15:04:00' ),
			array( '06/12/2017 3:04pm'  , '2017-06-12 15:04:00' ),
		);
	}

	/**
	 * @dataProvider saveCustomFormatDMYProvider
	 */
	public function test_save_custom_format_dmy( $value, $expected ) {
		$options = $this->defaultOptions;

		$options['datetime_type']          = 'custom';
		$options['datetime_format_custom'] = 'd/m/Y'; // Days and months switched.

		$this->assertEquals( $expected, $this->field->pre_save( $value, null, null, $options ) );
	}

	public function saveCustomFormatDMYProvider() {

		return array(
			array( '2017-12-06'         , '2017-12-06 00:00:00' ),
			array( '2017-12-06 15:04'   , '2017-12-06 15:04:00' ),
			array( '2017-12-06 15:04:50', '2017-12-06 15:04:50' ),
			array( '2017-06-12 15:04:50', '2017-06-12 15:04:50' ),
			// Display format d/m/Y.
			array( '12/06/2017 12:00am' , '2017-06-12 00:00:00' ),
			array( '12/06/2017 3:04pm'  , '2017-06-12 15:04:00' ),
			array( '06/12/2017 3:04pm'  , '2017-12-06 15:04:00' ),
		);
	}

	/**
	 * @dataProvider validateDefaultsProvider
	 */
	public function test_validate_defaults( $value, $expected ) {
		$options = $this->defaultOptions;

		$this->assertEquals( $expected, $this->field->validate( $value, null, null, $options ) );
	}

	public function validateDefaultsProvider() {

		return array(
			array( '2017-12-06'         , true ),
			array( '2017-12-06 15:04'   , true ),
			array( '2017-12-06 15:04:50', true ),
			array( '2017-06-12 15:04:50', true ),
			// Display format.
			array( '12/06/2017 12:00am' , true ),
			array( '12/06/2017 3:04pm'  , true ),
			array( '06/12/2017 3:04pm'  , true ),
		);
	}

	/**
	 * @dataProvider validateCustomFormatDMYProvider
	 */
	public function test_validate_custom_format_dmy( $value, $expected ) {
		$options = $this->defaultOptions;

		$options['datetime_type']          = 'custom';
		$options['datetime_format_custom'] = 'd/m/Y'; // Days and months switched.

		$this->assertEquals( $expected, $this->field->validate( $value, null, null, $options ) );
	}

	public function validateCustomFormatDMYProvider() {

		return array(
			array( '2017-12-06'         , true ),
			array( '2017-12-06 15:04'   , true ),
			array( '2017-12-06 15:04:50', true ),
			array( '2017-06-12 15:04:50', true ),
			// Display format.
			array( '12/06/2017 12:00am' , true ),
			array( '12/06/2017 3:04pm'  , true ),
			array( '06/12/2017 3:04pm'  , true ),
		);
	}

}
