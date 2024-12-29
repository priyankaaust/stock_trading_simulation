import session from 'express-session';

export default session({
    secret: 'team-j-secrete-session-key', // Replace with a secure key in production
    resave: false,             // Avoids resaving the session if it wasn't modified
    saveUninitialized: true,   // Saves a session even if it is new and not modified
    cookie: {
      maxAge: 1000 * 60 * 60,  // Session expiration time in milliseconds (e.g., 1 hour)
    },
})
