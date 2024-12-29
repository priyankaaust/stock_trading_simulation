import validator from 'validator';
// import { isAlphanumeric, isEmail, isMobilePhone } from 'validator';

/**
 * @author Team J
 * @version 1.0 
 * Date: January 19, 2022
 * This script contains functions to validate 
 * the fields of the contact sent by the client-side.
 * Since the validation can occur in parallel, we
 * can use Promise.all to check if all fields
 * are valid before inserting data in our file.
 * 
 * Simplified to a single async, E Brown. 2024
 **/ 


/**
 * This method validates in parallel all fields sent
 * from the client-side. 
 * @param {String} name 
 * @param {String} email 
 * @param {String} phone 
 * @returns [all results from validations, 
 *           unless any fails, then a single error 
 *           message is returned with the problem]
 */
async function validate_fields(name, email, phone) {
	name = name.split(' ').join(''); //Removing blanks
	if (! validator.isAlphanumeric(name) ) throw new TypeError("name is not alphanumeric")
	if (! validator.isEmail(email) ) throw new TypeError("bad email address")
	if (! validator.isMobilePhone(phone) ) throw new TypeError("bad phone number")
	// add an address validation test here
}

/**
 * This method validates in parallel all fields sent
 * from the client-side. 
 * @param {String} name 
 * @returns [all results from validations, 
 *           unless any fails, then a single error 
 *           message is returned with the problem]
 *
**/
async function validate_name(name) {
    if (! validator.isAlpha(name) ) throw new TypeError("bad name format")
}
async function validate_email(email) {
    if (! validator.isEmail(email) ) throw new TypeError("bad email address")
}
async function validate_phone(phone) {
    if (! validator.isMobilePhone(phone) ) throw new TypeError("bad phone number")
}

export default { validate_name , validate_email, validate_phone , validate_fields}