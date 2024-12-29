import assert from 'assert';
import persist from '../persist.js';
import { before, suite, test, beforeEach, afterEach, after } from 'node:test';

let test_users = [
    {
        name: 'Amilcar Soares',
        email: 'amilcarsj@mun.ca',
        tel: '709-456-7891',
        address: '230 Elizabeth Ave, St. John\'s, Newfoundland'
    },
    {
        name: 'John Smith',
        email: 'jsmith@mun.ca',
        tel: '709-456-7891',
        address: '235 Forest Road, St. John\'s, Newfoundland'
    },
    {
        name: 'Bob Churchil',
        email: 'bchurchil@mun.ca',
        tel: '709-987-6543',
        address: '50 Crosbie Road, St. John\'s, Newfoundland'
    }
];

suite('Test persist calls', function () {

    before(() => persist.initStore());
    after(() => {
        persist.closeStore();
        console.log("The test data has to be cleaned up manually - it has not been automated.");
    });

    test('Create New User', async () => {
        const result = await persist.createNewUser(
            'Test User',
            'testuser@example.com',
            '123-456-7890',
            'hashedpassword123',
            false
        );
        assert.ok(result, 'User creation should return a valid ID.');
    });

    test('Set and Retrieve Game Config', async () => {
        await persist.setGameConfig('2023-01-01T00:00:00Z', '2023-12-31T23:59:59Z', 15, 500);
        const config = await persist.getGameConfig();
        assert.ok(config, 'Game config should be retrieved.');
        assert.equal(config.gameDuration, 15, 'Game duration should match.');
        assert.equal(config.startingBalance, 500, 'Starting balance should match.');
    });

    test('Update Stock Prices', async () => {
        const stocksBefore = await persist.getStocks();
        assert.ok(stocksBefore.length > 0, 'Stocks should exist before update.');
        await persist.updateStockPrices();
        const stocksAfter = await persist.getStocks();
        assert.ok(stocksAfter.length > 0, 'Stocks should still exist after update.');
        // Additional validation for updated prices can be done here if data changes.
    });

    test('Start Game Session', async () => {
        const session = await persist.startGameSession();
        assert.ok(session, 'Game session should start successfully.');
        assert.ok(session.active, 'Game session should be active.');
    });

});
