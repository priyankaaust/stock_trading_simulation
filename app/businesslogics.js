/**
 * The project-specific logic for contacts project is in this module.
 * This module handles logic for user registration, authentication, 
 * game configuration, stock transactions, and session management.
 * 
 * @module businesslogic
 */

import persist from './persist.js';
import v from './validate-fields.js';
import { hashPassword, verifyPassword, getNthStartOfMonth, getNextBusinessDay } from './utils.js';
import moment from 'moment';
var db;

/**
 * Initialize the storage mechanism.
 * @async
 * @function init_logics
 * @returns {Promise<void>}
 */
export async function init_logics() {
    db = await persist.initStore();
}

/**
 * Closes the storage mechanism.
 * @function dispose_logics
 * @returns {void}
 */
export async function dispose_logics() {
    persist.closeStore();
}

/**
 * Registers a new player and creates a session.
 * @async
 * @function register
 * @param {Object} session - The session object to store user data.
 * @param {string} name - Name of the user.
 * @param {string} email - Email of the user.
 * @param {string} phone - Phone number of the user.
 * @param {string} password - User's password.
 * @param {string} confirmPassword - User's confirmed password.
 * @returns {Promise<Object>} The registered user object.
 * @throws {Error} If the passwords do not match or user already exists.
 */
export async function register(session, name, email, phone, password, confirmPassword) {
    await v.validate_fields(name, email, phone);

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    let existingUser = await persist.getUserByEmail(email);
    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(password);
    await persist.createNewUser(name, email, phone, passwordHash);

    return await login(session, email, password);
}

/**
 * Logs out the current user by destroying the session.
 * @async
 * @function logout
 * @param {Object} req - The request object containing session data.
 * @param {Function} cb - Callback function executed after logout.
 */
export async function logout(req, cb) {
    req.session.destroy(err => {
        if (err) {
            console.error('Failed to destroy session:', err);
            throw new Error("Failed to log out");
        }
        cb();
    });
}

/**
 * Authenticates a user based on email and password.
 * @async
 * @function login
 * @param {Object} session - The session object to store user data.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<Object>} The authenticated user object.
 * @throws {Error} If the email or password is invalid.
 */
export async function login(session, email, password) {
    await v.validate_email(email);

    const user = await persist.getUserByEmail(email);
    if (!user) {
        throw new Error("Invalid email");
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
        throw new Error("Invalid password");
    }

    session.user = {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
    };
    return user;
}

/**
 * Checks if the current session belongs to an admin.
 * @function is_admin
 * @param {Object} session - The session object containing user data.
 * @returns {boolean} True if the user is an admin, otherwise false.
 * @throws {Error} If session or user data is missing.
 */
export function is_admin(session) {
    if (!session || !session.user) {
        throw new Error("Session not found");
    }
    return session.user.isAdmin;
}

/**
 * Retrieves the game configuration.
 * @async
 * @function get_game_config
 * @returns {Promise<Object>} The game configuration object.
 */
export async function get_game_config() {
    return await persist.getGameConfig();
}

/**
 * Sets the game configuration.
 * @async
 * @function set_game_config
 * @param {number} [gameDuration=10] - Duration of the game session.
 * @param {number} [startingBalance=100] - Starting balance for players.
 * @returns {Promise<void>}
 * @throws {Error} If the input values are invalid.
 */
export async function set_game_config(simStartDate, simEndDate, gameDuration = 10, startingBalance = 100) {
   
    if (gameDuration < 1) throw new Error("Game duration should be at least 10 seconds");
    if (startingBalance < 10) throw new Error("Starting balance should be at least $10");

    await persist.setGameConfig(simStartDate, simEndDate, gameDuration, startingBalance);

}

/**
 * Retrieves the available stocks.
 * @async
 * @function get_stocks
 * @returns {Promise<Array>} An array of stock objects.
 */
export async function get_stocks() {
    return persist.getStocks();
}

/**
 * Retrieves all users, optionally including admins.
 * @async
 * @function get_users
 * @param {boolean} [includeAdmin=false] - Whether to include admin users.
 * @returns {Promise<Array>} An array of user objects.
 */
export async function get_users(includeAdmin = false) {
    return persist.getUsers(includeAdmin);
}

/**
 * Starts a new game session.
 * @async
 * @function start_game_session
 * @returns {Promise<Object>} The new active game session.
 */
export async function start_game_session() {
    await persist.startGameSession();
    return await get_active_game_session();
}

/**
 * Retrieves the currently active game session.
 * @async
 * @function get_active_game_session
 * @returns {Promise<Object|null>} The active game session or null if none.
 */
export async function get_active_game_session() {
    const activeSession = await persist.getActiveGameSession();
    if (activeSession && moment().isAfter(activeSession.endTime)) {
        await end_game_session(activeSession._id);
        return null;
    }
    return activeSession;
}

/**
 * Ends the specified game session.
 * @async
 * @function end_game_session
 * @param {string} id - ID of the game session to end.
 * @returns {Promise<void>}
 */
export async function end_game_session(id) {
    await persist.endGameSession(id);
}

/**
 * Retrieves the game status for a specific user.
 * @async
 * @function get_user_game_status
 * @param {string} gameId - ID of the game session.
 * @param {Object} req - The request object containing session data.
 * @returns {Promise<Object>} The user's game status.
 */
export async function get_user_game_status(gameId, req) {
    const userId = req.session['user']['userId'];
    return await persist.getUserGameStatus(gameId, userId);
}

export async function refresh_game_session(gameSessionId, minute) {
    const activeSession = await get_active_game_session();
    if(!activeSession) {
        throw new Error("No active game session")
    }

    const simulationStartDate = activeSession["simulationStartDate"]
    const simulationEndDate = activeSession["simulationEndDate"]

    console.log("simulationStartDate", simulationStartDate);
    console.log("simulationEndDate", simulationEndDate);
    console.log("minute", minute);
    
    const startOfMonth = getNthStartOfMonth(simulationStartDate, simulationEndDate, minute)
    const data = {
        minute: minute,
        date: startOfMonth
    }

    console.log("start of month", startOfMonth);
    
    const businessDate = getNextBusinessDay(startOfMonth)

    console.log("corresponding business day ", startOfMonth);
    // console.log("data: ", data);
    // return data

    
    return await persist.refreshGameSession(gameSessionId, businessDate, minute)
}

/**
 * Adds the user to a game session.
 * @async
 * @function join_game
 * @param {string} gameId - ID of the game session to join.
 * @param {Object} req - The request object containing session data.
 * @returns {Promise<void>}
 */
export async function join_game(gameId, req) {
    const userId = req.session['user']['userId'];
    const username = req.session['user']['name'];
    return await persist.joinGameSession(gameId, userId, username);
}

/**
 * Buys a specified stock.
 * @async
 * @function buy_stock
 * @param {string} boardId - ID of the board.
 * @param {string} stockId - ID of the stock.
 * @param {string} ticker - Stock ticker symbol.
 * @param {number} shares - Number of shares to buy.
 * @returns {Promise<void>}
 */
export async function buy_stock(boardId, stockId, ticker, shares) {
    await persist.buyStock(boardId, stockId, ticker, shares);
}

/**
 * Sells a specified stock.
 * @async
 * @function sell_stock
 * @param {string} boardId - ID of the board.
 * @param {string} stockId - ID of the stock.
 * @param {string} ticker - Stock ticker symbol.
 * @param {number} shares - Number of shares to sell.
 * @returns {Promise<void>}
 */
export async function sell_stock(boardId, stockId, ticker, shares) {
    await persist.sellStock(boardId, stockId, ticker, shares);
}

/**
 * Fetches participants in a specific game session.
 * @async
 * @function fetch_game_participants
 * @returns {Promise<Array>} Array of participant objects.
 */
export async function fetch_game_participants(gameId) {
    return await persist.fetchGameParticipants(gameId);
}

export async function fetch_leader_board(gameId) {
    return await persist.fetchLeaderBoard(gameId);
}

export async function fetch_portfolio_progress(gameId, userId) {
    return await persist.fetchPortfolioProgress(gameId, userId);
}

export async function fetch_game_sessions(sessionId) {
    return await persist.getGameSessions();
}

