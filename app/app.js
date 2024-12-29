import express, { json, urlencoded } from 'express';
import path from 'path';
import session from './session-manager.js';
import flash from 'connect-flash';
import moment from 'moment';

import {
    init_logics,
    login,
    logout,
    register,
    is_admin,
    set_game_config,
    get_game_config,
    start_game_session,
    get_stocks,
    get_users,
    get_active_game_session,
    get_user_game_status,
    join_game,
    buy_stock,
    sell_stock,
    fetch_game_participants,
    refresh_game_session,
    fetch_leader_board,
    fetch_portfolio_progress,
    fetch_game_sessions
} from './businesslogics.js';

const app = express();

app.use(express.json()); // support JSON encoded bodies
app.use(express.urlencoded({ extended: true })); // support URL-encoded bodies
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(path.resolve(), 'public'))); // serve static files
app.use(session);
app.use(flash());

/**
 * Middleware to pass flash messages and session data to all views.
 * @function
 * @name flashAndSessionMiddleware
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Callback function to move to the next middleware.
 */
app.use(async (req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.user = req.session['user'];
    res.locals.moment = moment
    const activeGameSession = await get_active_game_session();
    res.locals.activeGameSession = activeGameSession;
    next();
});

// Initialize the business logic module
init_logics();

/**
 * Renders the main index page.
 * @route GET /
 * @name index
 * @returns {void}
 */
app.get('/', (req, res) => {
    res.render('index');
});

/**
 * Renders the login page or redirects if already logged in.
 * @route GET /login
 * @name loginPage
 * @returns {void}
 */
app.get('/login', (req, res) => {
    if (req.session['user']) {
        res.redirect(req.session['user'].isAdmin ? "/admin/home" : "/home");
        return;
    }
    res.render('user-admin-login', { type: req.query.type });
});

/**
 * Logs out the user and redirects to the home page.
 * @route GET /logout
 * @name logout
 * @returns {void}
 */
app.get('/logout', (req, res) => {
    try {
        logout(req, () => {
            res.redirect("/");
        });
    } catch (e) {
        req.flash('errors', e.message);
        res.redirect("back");
    }
});

/**
 * Handles login form submission.
 * @route POST /login
 * @name handleLogin
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await login(req.session, email, password);
        res.redirect(user.isAdmin ? "/admin/home" : "/home");
    } catch (error) {
        req.flash('errors', error.message);
        res.redirect("/login");
    }
});

/**
 * Renders the registration page.
 * @route GET /register
 * @name registrationPage
 * @returns {void}
 */
app.get('/register', (req, res) => res.render('user-registeration'));

/**
 * Handles user registration.
 * @route POST /register
 * @name handleRegistration
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
app.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, confirm_password: confirmPassword } = req.body;
        const user = await register(req.session, name, email, phone, password, confirmPassword);
        res.redirect(user.isAdmin ? "/admin/home" : "/home");
    } catch (error) {
        req.flash('errors', error.message);
        res.redirect("/register");
    }
});

/**
 * Renders the admin dashboard with stocks, users, and game participants.
 * @route GET /admin/home
 * @name adminHome
 * @returns {void}
 */
app.get('/admin/home', async (req, res) => {
    if (req.session['user'] && req.session['user'].isAdmin) {
        const portfolioUserId = req.query['portfolioUserId'];
        const portfolioUserName = req.query['portfolioUserName'];
        const stocks = (await get_stocks()) || [];
        const users = (await get_users()) || [];
        const activeGameSession = res.locals.activeGameSession;
        
        let leaderBoard = [];
        let portfolio = []
        if (activeGameSession) {
            
            leaderBoard = await fetch_leader_board(activeGameSession['_id']);
            if(portfolioUserId) {
                portfolio = await fetch_portfolio_progress(activeGameSession['_id'], portfolioUserId || req.session['user']['userId']);
            }
            
        }
        res.render('admin-home', { path: '/admin/home',
            stocks, users, 
            portfolioUserId: portfolioUserId,            
            portfolioUserName:  portfolioUserName,
            portfolio,
            leaderBoard
         });
        return;
    }
    res.redirect("/login");
});

/**
 * Renders the user home page with stocks and user game status.
 * @route GET /home
 * @name userHome
 * @returns {void}
 */
app.get('/home', async (req, res) => {
    const portfolioUserId = req.query['portfolioUserId'];
    const portfolioUserName = req.query['portfolioUserName'];
    if (req.session['user'] && !req.session['user'].isAdmin) {
        let userGameStatus = null;
        const activeGameSession = res.locals.activeGameSession;
        let leaderBoard = [];
        let portfolio = []
        if (activeGameSession) {
            userGameStatus = await get_user_game_status(activeGameSession['_id'].toString(), req);
            leaderBoard = await fetch_leader_board(activeGameSession['_id']);
            portfolio = await fetch_portfolio_progress(activeGameSession['_id'], portfolioUserId || req.session['user']['userId']);
        }
        const stocks = (await get_stocks()) || [];
        res.render('user-home', { userGameStatus, stocks, leaderBoard, portfolio, 
            portfolioUserId: portfolioUserId || req.session['user']['userId'],            
            portfolioUserName:  portfolioUserName || req.session['user']['name'] 
         });
        return;
    }
    res.redirect('/login');
});

app.get("/admin/users", async  (req, res) => {
    try {
        const users = await get_users();
        res.render("admin-users", {users: users,  path: '/admin/users'});
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch users" });
    }
})
app.get("/portfolios/:userType", async  (req, res) => {
    let  gameId  = req.query['gameId']
    let  userId  = req.query['userId']
    let  userName = req.query['userName']
    let  userType = req.params['userType']

    try {
        const gameSessions = await fetch_game_sessions();
        const users = await get_users();

        
        if(!gameId) {
            if(gameSessions.length > 0) { 
                const firstGameSession = gameSessions[0];
                gameId = firstGameSession['_id'].toString();   
            }
        }

        // we've decided to fetch first participant instead of first user. so data can show
        if(gameId && !userId) {
            const participants = await fetch_game_participants(gameId)
            if(participants.length > 0) {
                userId = participants[0]['userId']
                userName = participants[0]['userName']
            }
        }

        let portfolio = []
        if(gameId && userId) {
            portfolio = await fetch_portfolio_progress(gameId, userId)         
        }
      

        const data =  {
            gameSessions: gameSessions,
            users: users,
            gameId: gameId,
            userId: userId,
            userName: userName,
            portfolio: portfolio,
        }

        res.render(userType == "admin" ? "admin-portfolio" : "user-portfolio", data );

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: e.message });
    }
})

app.get("/leaderboards/:userType", async  (req, res) => {

    let  gameId  = req.query['gameId']
    let  userType = req.params['userType']

    try {
        const gameSessions = await fetch_game_sessions();
        let leaderBoard = []

        if(!gameId && gameSessions.length > 0) { 
            const firstGameSession = gameSessions[0];
            gameId = firstGameSession['_id'].toString();            
        }

        if(gameId) {
            leaderBoard = await fetch_leader_board(gameId)
        }



        // console.log("session: " + JSON.stringify(data['sessions']));
        // res.json(data[]);
        

        res.render(userType == "admin" ? "admin-leaderboard" : "user-leaderboard", {
            gameSessions: gameSessions,
            gameId: gameId,
            leaderBoard: leaderBoard,
        });

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: e.message });
    }
})

/**
 * Updates game configuration settings.
 * @route POST /admin/game/config
 * @name updateGameConfig
 * @returns {void}
 */
app.post('/admin/game/config', async (req, res) => {
    try {
        const { game_duration: gameDuration, starting_balance: startingBalance, sim_start_date, sim_end_date } = req.body;
        const simStartDateToDate = moment(sim_start_date).toISOString()
        const simEndDateToDate = moment(sim_end_date).toISOString()
        await set_game_config(simStartDateToDate, simEndDateToDate, +gameDuration, +startingBalance,);
    } catch (e) {
        req.flash('errors', e.message);
        return;
    }
    res.redirect('/admin/game/config');
});

/**
 * Renders game configuration settings.
 * @route GET /admin/game/config
 * @name gameConfig
 * @returns {void}
 */
app.get('/admin/game/config', async (req, res) => {
    const gameConfig = await get_game_config();
    // console.log("gameConfig", gameConfig['simStartDate']);
    
    res.render('admin-game-config', { config: {
        ...gameConfig,
        simStartDate: moment(gameConfig['simStartDate']).format("YYYY-MM-DD"),
        simEndDate: moment(gameConfig['simEndDate']).format("YYYY-MM-DD"),
    }, path: '/admin/game/config' });
});

/**
 * Starts a new game session.
 * @route GET /admin/start-game
 * @name startGameSession
 * @returns {void}
 */
app.get('/admin/start-game', async (req, res) => {
    try {
        await start_game_session();
    }catch(err) {
        req.flash('errors', err.message)
    }finally {
        res.redirect('/admin/home');
    }
    
});

/**
 * Joins an active game session.
 * @route GET /user/join-game/:gameId
 * @name joinGame
 * @returns {void}
 */
app.get('/user/join-game/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    await join_game(gameId, req);
    res.redirect('/home');
});

/**
 * Handles stock transactions (buy/sell).
 * @route POST /user/transact-stock
 * @name transactStock
 * @returns {void}
 */
app.post('/user/transact-stock', async (req, res) => {
    try {

        const { shares, ticker, boardId, stockId } = req.body;
        const action = req.body.action;

        if (action === 'buy') {
            await buy_stock(boardId, stockId, ticker, +shares);
        } else if (action === 'sell') {
            await sell_stock(boardId, stockId, ticker, +shares);
        }
        res.redirect('/home');

    }catch (err) { 
        req.flash('errors', err.message);
        res.redirect('back');
    }
});

app.get("/admin/refresh-game-session", async (req, res) => { 

    try {

        const { gameSessionId, minute } = req.query;
        const result = await refresh_game_session(gameSessionId, minute)
        res.json({ status : "success", data: result });

    }catch (err) {
        res.json({ status: "error", message: err.message });
    }

})

app.on('close', () => console.log("CLOSING"));

export default app;
