import {  MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { getNextBusinessDay, hashPassword } from './utils.js';
import moment from 'moment';

/**
 * A module to mock or stub an interface for persistence on Contacts information.
 * It only stores data in a non-persistent list.
 */

const stocksOfInterest = [
  {ticker: "AAPL", company: "Apple"},
  {ticker: "GOOGL", company: "Google"},
  {ticker: "MSFT", company: "Microsoft"},
]

const apiToken = 'eegavq5RrAwcZEvx4E__WGfRTMT7jOcc';
const adminEmail = "teamj-admin@mun.ca"  
const adminPassword = "123456"
const connectionString = "mongodb+srv://danielkwakye1000:4FUIEOmQbn4cRPUU@cluster0.z5elz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
var db;
let users;
let stocks
let configs
let gameSessions
let gameBoards
let portfolios
let transactions

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(connectionString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

/**
 * Initializes the database store and collections.
 * Connects to the MongoDB client, sets up collections, and creates an admin user if not already present.
 */

// persist.js
async function initStore() {

  // Connect the client to the server
  await client.connect();
  db = await client.db("stocks-db");
  console.log("Connected successfully to mongoDB");
  users = await db.collection("users");
  configs = await db.collection("configs");
  stocks = await db.collection("stocks");
  gameBoards = await db.collection("boards");
  gameSessions = await db.collection("game-sessions");
  portfolios = await db.collection("portfolios");
  transactions = await db.collection("transactions");


  // chreate admin if admin does not exist
  const admin = await getUserByEmail(adminEmail)
  if(!admin) {
    const passwordhash = await hashPassword(adminPassword);
    await createNewUser("Team J", adminEmail, "647-123-4567", passwordhash, true)
  }

  // set default game configuration
  const gameConfig = await getGameConfig()
  if(!gameConfig) {
    const configSimStartDate = moment("2022-02-01").toISOString()
    const configSimEndDate = moment("2024-11-01").toISOString()
    setGameConfig(configSimStartDate, configSimEndDate)
  }

  await updateStockPrices()
  // No connection is attempted
}

/**
 * Closes the MongoDB connection.
 * @param {string} cSetName - Name of the collection set.
 * @returns {Promise<string>} Confirmation that the connection is closed.
 */
async function closeStore(cSetName) {
    await client.close();
    return 'Connection closed';
}

/**
 * Retrieves a user by email.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<Object>} User document or null if not found.
 */

async function getUserByEmail(email) {
  // get a user whose email matches
  const query = {email: email};
  return await users.findOne(query);

}

/**
 * Creates a new user in the database.
 * @param {string} name - Name of the user.
 * @param {string} email - Email address of the user.
 * @param {string} phone - Phone number of the user.
 * @param {string} hashedPassword - Hashed password of the user.
 * @param {boolean} isAdmin - Indicates if the user is an admin.
 * @returns {Promise<ObjectId>} The inserted user's ID.
 */
async function createNewUser(name, email, phone, hashedPassword, isAdmin = false) { 
   const result = await users.insertOne({
     name: name,
     email: email,
     phone: phone,
     passwordHash: hashedPassword,
     isAdmin: isAdmin,
    });
    console.log("inserted user result", result.insertedId);
    return result.insertedId
}


/**
 * Retrieves the game configuration document.
 * @returns {Promise<Object>} Game configuration document.
 */
async function getGameConfig() {
  return await configs.findOne({ 'type': 'game-config' })
}


/**
 * Sets or updates the game configuration.
 * @param {number} gameDuration - Duration of the game in seconds.
 * @param {number} startingBalance - Starting balance for each player.
 */
export async function setGameConfig( simStartDate, simEndDate, gameDuration = 10, startingBalance = 100) {
  
  // Create a filter for movies with the title "Random Harvest"
  const filter = { 'type': 'game-config' };

  /* Set the upsert option to insert a document if no documents match
    the filter */
    const options = { upsert: true };

    // Specify the update to set a value for the plot field

    const updateDoc = {
      $set: {
        simStartDate: simStartDate || new Date("2022-02-01"),
        simEndDate: simEndDate || new Date("2024-09-01"),
        gameDuration: gameDuration,
        startingBalance: startingBalance,
      },
    };

    // Update the first document that matches the filter
    const result = await configs.updateOne(filter, updateDoc, options);

    // Print the number of matching and modified documents
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );

}

/**
 * Ends a game session by marking it as inactive.
 * @param {ObjectId} id - ID of the game session to end.
 */
export async function endGameSession(id) {
  // end game session 
  await gameSessions.updateOne({_id: id}, { $set: { active: false } });
}

/**
 * Retrieves the active game session.
 * @returns {Promise<Object>} Active game session document or null if none.
 */
export async function getActiveGameSession() {
  return await gameSessions.findOne({active: true})
}

/**
 * Starts a new game session if there is no active session.
 * @returns {Promise<Object>} The newly created game session document.
 * @throws {Error} If no game configuration is found.
 */
export async function startGameSession() {

  const startDateTime = moment(); // Get current time
  const config = await configs.findOne({ 'type': 'game-config' })
  if(!config) {
      throw new Error('No game configuration found')
  }
  const runningGame = await getActiveGameSession()
  if(runningGame) { 
    return runningGame
  }

  // const endTime = new Date(startTime.getTime() + config.gameDuration * 1000);
  // Calculate end datetime
  console.log("game duration: " + config.gameDuration);
  
  const endDateTime = startDateTime.clone().add(config.gameDuration, 'minutes');
  
  console.log("startTime:", startDateTime);
  console.log("endTime:", endDateTime);
  if(endDateTime.isSameOrBefore(startDateTime)) {
    throw new Error("Cannot start game")
  }
  

  const gameSessionPayload = {
    startTime: startDateTime.toISOString(),
    endTime: endDateTime.toISOString(),
    active: true,
    simulationStartDate: config['simStartDate'] || moment().toISOString(),
    simulationEndDate: config['simEndDate'] || moment().toISOString(),
    createdAt: moment().toISOString(),
  }
  
  await gameSessions.insertOne(gameSessionPayload) 
  
  return gameSessionPayload

}


async function getUserGameStatus(gameSessionId, userId) {
  const status = await gameBoards.findOne({gameSessionId: gameSessionId, userId: userId})
  return status;
}

/**
 * Joins a user to an existing game session.
 * @param {ObjectId} gameSessionId - ID of the game session.
 * @param {ObjectId} userId - ID of the user.
 * @param {string} userName - Name of the user.
 */
async function joinGameSession(gameSessionId, userId, userName) {

  const gameConfig = await configs.findOne({ 'type': 'game-config' })
  if(!gameConfig) { 
      throw new Error("No game config found")
  }

  const userStatus = await getUserGameStatus(gameSessionId, userId)
  if(userStatus) {
    return
  }

  await gameBoards.insertOne( {
    gameSessionId: gameSessionId,
    userId: userId,
    userName: userName,
    startingBalance: gameConfig.startingBalance,
    availableBalance: gameConfig.startingBalance,
    currentBalance: gameConfig.startingBalance,
    AAPL: 0,
    GOOGL: 0,
    MSFT: 0,
    AAPL_balance: 0,
    GOOGL_balance: 0,
    MSFT_balance: 0,
  },)

  const minuteAt = "1"
  // Create a portfolio
  setPortfolio(gameSessionId, userId, userName, minuteAt)

  // log transaction
  transactions.insertOne({
    gameSessionId: gameSessionId,
    transType: "INIT",
    ticker: 'N/A',
    currentStockPrice: 0,
    transQuantity: 0,
    transAmount: 0,
    previousAvailableBalance: gameConfig.startingBalance,
    newAvailableBalance: gameConfig.startingBalance,
    createdAt: moment().toISOString(),
  })
  
}

async function setPortfolio(gameSessionId, userId, userName, minuteAt) {

  const gameBoard = await gameBoards.findOne({gameSessionId: gameSessionId, userId: userId})
  const currentBalance = gameBoard.availableBalance + gameBoard['AAPL_balance'] + gameBoard['GOOGL_balance'] + gameBoard['MSFT_balance']

  await portfolios.insertOne( { 
    gameSessionId: gameSessionId,
    userId: userId,
    userName: userName,
    currentBalance: currentBalance,
    AAPL_balance: gameBoard['AAPL_balance'],
    GOOGL_balance: gameBoard['GOOGL_balance'],
    MSFT_balance: gameBoard['MSFT_balance'],
    createdAt: moment().toISOString(),
    minuteAt: +minuteAt
  } )

  
  const boardId = gameBoard['_id']
  console.log("gameBoard id, ", boardId);
  
  await gameBoards.updateOne({ _id: boardId }, {
    $set: {
      currentBalance: currentBalance,
    },
  })

}

async function closeBoardBalances(boardId) {

  const board = gameBoards.findOne({ _id: boardId })
  const newAvailableBalance = board.availableBalance + board.AAPL_balance + board.GOOGL_balance + board.MSFT_balance
  await gameBoards.updateOne({ _id: boardId}, {
    $set: {
      availableBalance: newAvailableBalance,
      AAPL: 0,
      GOOGL: 0,
      MSFT: 0,
      AAPL_balance: 0,
      GOOGL_balance: 0,
      MSFT_balance: 0,
    },
  })
}

async function buyStock(boardId, stockId, ticker, shares) {

  const q1 = { _id: ObjectId.createFromHexString(stockId) };
  const q2 = { _id: ObjectId.createFromHexString(boardId) };
  console.log('query', q1, q2);
  
  const stock = await stocks.findOne(q1);
  const board = await gameBoards.findOne(q2);

  // Calculate the current number of shares owned and the new number after the purchase
  const currentSharesOwned = board[ticker] || 0;
  const newSharesOwned = currentSharesOwned + shares;

  // Calculate the cost of only the additional shares
  const purchaseAmount = stock.price * (shares / 100);

  // Check if there are sufficient funds
  if (purchaseAmount > board.availableBalance) {
    throw new Error('Not enough funds');
  }

  // Deduct the cost of the additional shares from available balance
  const updatedAvailableBalance = board.availableBalance - purchaseAmount;

  // Calculate the total balance for all shares owned after the purchase
  const totalSharesAmount = stock.price * (newSharesOwned / 100);

  // Create a transaction for it.

  // Update the board with the new available balance, shares owned, and ticker balance
  await gameBoards.updateOne(
    { _id: ObjectId.createFromHexString(boardId) },
    {
      $set: {
        availableBalance: updatedAvailableBalance,
        [ticker]: newSharesOwned,
        [ticker + '_balance']: totalSharesAmount,
      },
    }
  );

  // log transaction
  transactions.insertOne({
    gameSessionId: board["gameSessionId"],
    transType: "BUY",
    ticker: ticker,
    currentStockPrice:  stock.price,
    transQuantity: shares,
    transAmount: purchaseAmount,
    previousAvailableBalance: board.availableBalance,
    newAvailableBalance: updatedAvailableBalance,
    createdAt: moment().toISOString(),
  })

}

async function sellStock(boardId, stockId, ticker, shares) {

  const q1 = { _id: ObjectId.createFromHexString(stockId) };
  const q2 = { _id: ObjectId.createFromHexString(boardId) };

  const stock = await stocks.findOne(q1);
  const board = await gameBoards.findOne(q2);

  // Get the current number of shares owned for the ticker
  const currentSharesOwned = board[ticker] || 0;

  // Check if the user has enough shares to sell
  if (shares > currentSharesOwned) {
    throw new Error('Not enough shares to sell');
  }

  // Calculate the amount to add back to available balance for the shares sold
  const saleAmount = stock.price * (shares / 100);

  // Update the remaining shares after the sale
  const newSharesOwned = currentSharesOwned - shares;

  // Update the total balance for the remaining shares
  const newSharesAmount = stock.price * (newSharesOwned / 100);

  // Increase the available balance by the sale amount
  const updatedAvailableBalance = board.availableBalance + saleAmount;

  // Update the board with the new available balance, shares owned, and ticker balance
  await gameBoards.updateOne(
    { _id: ObjectId.createFromHexString(boardId) },
    {
      $set: {
        availableBalance: updatedAvailableBalance,
        [ticker]: newSharesOwned,
        [ticker + '_balance']: newSharesAmount,
      },
    }
  );

  // log transaction
  transactions.insertOne({
    gameSessionId: board["gameSessionId"],
    transType: "SELL",
    ticker: ticker,
    currentStockPrice:  stock.price,
    transQuantity: shares,
    transAmount: newSharesAmount,
    previousAvailableBalance: board.availableBalance,
    newAvailableBalance: updatedAvailableBalance,
    createdAt: moment().toISOString(),
  })
}


async function fetchGameParticipants(gameId) {
  // Define the query with gameSessionId and runtime conditions
  const query = { gameSessionId: gameId.toString() };

  console.log("Query:", query);

  // Execute the query and convert the cursor to an array
  const cursor = await gameBoards.find(query);
  const arr = await cursor.toArray();
  return arr;
}

async function fetchLeaderBoard(gameId) {
  const query = { gameSessionId: gameId.toString() };
  const options = {
    // Sort returned documents in ascending order by title (A->Z)
    sort: { currentBalance: -1 },

  };
  const cursor = await gameBoards.find(query, options);
  const arr = await cursor.toArray();
  return arr;

}

async function getGameSessions() {

  const options = {
    // Sort returned documents in ascending order by title (A->Z)
    sort: { createdAt: -1 },

  };

  const cursor = await gameSessions.find({}, options);
  const sessions = await cursor.toArray()
  return sessions;
}



async function fetchPortfolioProgress(gameId, userId) {
  const query = { gameSessionId: gameId.toString() , userId: userId };
  const options = {
    // Sort returned documents in ascending order by title (A->Z)
    sort: { createdAt: 1 },

  };
  const cursor  = await portfolios.find(query, options)
  const arr = await cursor.toArray();
  return arr
}


// async function updateUserOnLeaderboard(gameSessiongId, userId, newPrice) {
//   // Create a filter for movies with the title "Random Harvest"
//   const filter = { gameSessiongId: gameSessiongId, userId: userId };

//   // Specify the update to set a value for the plot field
//   const updateDoc = {
//     $set: {
//       price: newPrice
//     },
//   };
//   // Update the first document that matches the filter
//   const result = await gameBoards.updateOne(filter, updateDoc);

// }

async function findLeaderBoard(id) {
  return gameBoards.findOne({ _id: id })
}

async function getLeaders(gameSessionId) {
  // Query for movies that have a runtime less than 15 minutes
  const query = { runtime: { $lt: 100 } }; 
  // Execute query 
  const cursor = gameBoards.find(query);
  return cursor
}


async function setStock(ticker, company, price) {

  // Create a filter for movies with the title "Random Harvest"
  const filter = { ticker: ticker };
  /* Set the upsert option to insert a document if no documents match
  the filter */
  const options = { upsert: true };
  // Specify the update to set a value for the plot field
  const updateDoc = {
    $set: {
      ticker: ticker,
      company: company,
      price: price,
    },
  };
  // Update the first document that matches the filter
  const result = await stocks.updateOne(filter, updateDoc, options);
  
  // Print the number of matching and modified documents
  console.log(
    `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
  );

  return result.matchedCount

}

async function getStocks() {
  const query = {};

  // Execute query and get a cursor
  const cursor = stocks.find(query);

  // Check if there are any documents
  if ((await stocks.countDocuments(query)) === 0) {
    return []; // Return an empty array if no documents were found
  }

  // Convert cursor to array and return the documents
  const stocksArray = await cursor.toArray();
  return stocksArray;
}

async function getUsers(includeAdmin = false) {
  const query = {isAdmin: includeAdmin};

  // Execute query and get a cursor
  const cursor = users.find(query);

  // Check if there are any documents
  if ((await users.countDocuments(query)) === 0) {
    return []; // Return an empty array if no documents were found
  }

  // Convert cursor to array and return the documents
  const stocksArray = await cursor.toArray();
  return stocksArray;
}

async function removeStock(id) {
  const query = { _id: id };
  const result = await stocks.deleteOne(query);

  if (result.deletedCount === 1) {
    return "Stock removed successfully";
  } else {
    throw new Error("No documents matched the query. Deleted 0 documents.")
  }

}

async function updateStockPrices() {

    const promises = stocksOfInterest.map(stock => getLastTrade(stock));
    await Promise.all(promises);

}

/// Fetches the prices and updates the database with the stocks and its price
async function getLastTrade(stock) {
  const lastTradeUrl = 'https://api.polygon.io/v2/last/trade/' + stock.ticker;
  const response = await fetch(lastTradeUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Trade Data:', data);
  const price = data.results['p']
  const stockWithPrice = { ticker: stock.ticker, company: stock.company, price: price  };
  await setStock(stockWithPrice.ticker, stockWithPrice.company, stockWithPrice.price)
  return stockWithPrice;

}


async function refreshGameSession(gameSessionId, date, minuteAt) {
   
    console.log("refresh game session called ....");
    
    // Query for movies that have a runtime less than 15 minutes
    const query = { };
    const options = {
      // Include only the `ticker`  fields in each returned document
      projection: { _id: 0, ticker: 1, company: 1 },
    };

    // Execute query 
    const cursor = stocks.find(query, options);

    // Print a message if no documents were found
    if ((await stocks.countDocuments(query)) === 0) {
      console.log("No documents found!");
    }
    // Print returned documents
    const stocksArr = []
    for await (const doc of cursor) {
      console.dir(doc);
     
      stocksArr.push(doc)
    }

    console.log("tickers: " + stocksArr);
    const promises = stocksArr.map((stk, index) => refreshStockPrice(stk['ticker'], stk['company'],  date))
    const resolves = await Promise.all(promises)
    console.log("Resolved: ", resolves)

    const relatedBoards = await fetchGameParticipants(gameSessionId)
    console.log("related boards: ====> " , relatedBoards);


    for (const board of relatedBoards) {

      for (const refreshedStock of resolves) {


        // get ticker shares
        const ticker = refreshedStock['ticker']
        const newPrice = refreshedStock['price']

        const shares = board[ticker]
        
        // Calculate the cost of only the additional shares
        const newSharesValue = newPrice * (shares / 100);

        let updatedCurrentBalanceBuildup = board["currentBalance"] - board[ticker + '_balance']

        const updatedCurrentBalance = updatedCurrentBalanceBuildup + newSharesValue

        const boardId = board['_id']

        console.log("board id : ", boardId);
        console.log("updatedCurrentBalance : ", updatedCurrentBalance);        
        
        // calculate new shares amount

        await gameBoards.updateOne(
          { _id: boardId },
          {
            $set: {
              currentBalance: updatedCurrentBalance, // update total current balance 
              [ticker + '_balance']: newSharesValue, // update shares amount
            },
          }
        );

        // save portfolio
         
      }

      setPortfolio(gameSessionId, board['userId'], board['userName'], minuteAt)
      
    }

    // fresh the current balance for each participant.
    // const gameParticipants = await fetchGameParticipants(gameSessionId)
    // console.log("participants: ", gameParticipants);

    
    // for (const participant of gameParticipants) {
    //   const userId = participant._id.toString()
    //   const user = await users.findOne({ _id: userId })
    //   if (user) {
    //     await updateUserOnLeaderboard(gameSessionId, userId, user.price)
    //   }
    // }

}



async function refreshStockPrice(ticker, company, date) {

  console.log("busisness day: ", date);
  

  // const tradeUrl = 'https://api.polygon.io/v2/last/trade/' + stock.ticker
  // const tradeUrl = `https://api.polygon.io/v3/trades/${ticker}?timestamp=${businessDay}&limit=1`
  const tradeUrl = `https://api.polygon.io/v3/trades/AAPL?timestamp=${date}&limit=1`
  console.log("trade url:", tradeUrl);
  
  const response = await fetch(tradeUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Trade Data:', data);
  if(!data['results'] || data['results'].length === 0) {
    throw new Error(`Empty response`)
  }

  
  const stockInfo = data.results[0]
  const price = stockInfo.price
  setStock(ticker, company, price)
  return { ticker: ticker, price: price}

}





export default { 
  initStore, 
  closeStore, 
  getUserByEmail, 
  createNewUser, 
  getGameConfig,
  getLeaders,
  setGameConfig, 
  startGameSession,
  findLeaderBoard,
  joinGameSession,
  getUserGameStatus,
  getStocks,
  setStock,
  // updateUserOnLeaderboard,
  removeStock,
  getActiveGameSession,
  updateStockPrices,
  endGameSession,
  getUsers,
  buyStock,
  sellStock,
  fetchGameParticipants,
  refreshGameSession,
  fetchLeaderBoard,
  fetchPortfolioProgress,
  getGameSessions
 }

