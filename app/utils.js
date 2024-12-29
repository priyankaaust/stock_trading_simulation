import bcrypt from 'bcrypt';
import moment from 'moment-business-days';

export async function hashPassword(plainPassword) {
    const saltRounds = 10; // The cost factor for hashing, higher is more secure but slower
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}

export async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}


export function getNextBusinessDay(date) {
    let givenDate = moment(date); // Parse the given date with Moment.js

    // Check if it's a weekend or holiday
    if (!givenDate.isBusinessDay()) {
        givenDate = givenDate.nextBusinessDay(); // Get the next business day
    }

    // Return the resulting date in ISO format
    return givenDate.format('YYYY-MM-DD');
}

/**
 * Get the Nth start-of-month date within a simulation range
 * @param {string} simulationStartDate - ISO string of the simulation start date
 * @param {string} simulationEndDate - ISO string of the simulation end date
 * @param {number} nth - Integer representing the Nth start of the month
 * @returns {string|null} - The ISO string of the resulting date or null if not found
 */

/**
 * Get the Nth start-of-month date within a simulation range
 * @param {string} simulationStartDate - ISO string of the simulation start date
 * @param {string} simulationEndDate - ISO string of the simulation end date
 * @param {number} nth - Integer representing the Nth start of the month
 * @returns {string} - The ISO string of the resulting date
 */
export function getNthStartOfMonth(simulationStartDate, simulationEndDate, nth) {
    
    const startDate = moment(simulationStartDate).startOf('month'); // Align to the start of the first month
    const endDate = moment(simulationEndDate).startOf('month'); // Align to the start of the last month

    if (!startDate.isValid() || !endDate.isValid()) {
        throw new Error("Invalid date provided.");
    }

    if (nth < 1) {
        throw new Error("The integer must be greater than or equal to 1.");
    }

    // Calculate the Nth month from the start
    const nthDate = startDate.clone().add(nth - 1, 'months'); // Subtract 1 because nth starts from 1
    if (nthDate.isAfter(endDate)) {
        // If Nth date is out of range, pick a random month within the range
        const totalMonths = endDate.diff(startDate, 'months') + 1; // Total months between start and end
        const randomOffset = Math.floor(Math.random() * totalMonths); // Random offset within range
        return startDate.clone().add(randomOffset, 'months').toISOString();
    }

    return nthDate.toISOString();
}
