import assert from 'assert';
import * as businessLogic from '../businesslogics.js';
import persist from '../persist.js';
import { before, suite, test, beforeEach, afterEach, after } from 'node:test';

suite('Business Logic Tests', function () {

    let mockSession = {};

    before(async () => {
        await businessLogic.init_logics();
    });

    after(async () => {
        await businessLogic.dispose_logics();
    });

    test('Register a new user', async () => {
        const user = await businessLogic.register(
            mockSession,
            'Test User',
            'testuser@example.com',
            '123-456-7890',
            'password123',
            'password123'
        );
        assert.ok(user, 'New user should be registered successfully.');
        assert.equal(user.email, 'testuser@example.com', 'Email should match the registered user.');
    });

    test('Login with valid credentials', async () => {
        const user = await businessLogic.login(
            mockSession,
            'testuser@example.com',
            'password123'
        );
        assert.ok(user, 'User should log in successfully.');
        assert.equal(user.email, 'testuser@example.com', 'Email should match the logged-in user.');
    });

    test('Get Game Configuration', async () => {
        const config = await businessLogic.get_game_config();
        assert.ok(config, 'Game configuration should be fetched.');
        assert.ok(config.startingBalance >= 10, 'Starting balance should be valid.');
    });

    test('Start a new game session', async () => {
        const session = await businessLogic.start_game_session();
        assert.ok(session, 'Game session should start successfully.');
        assert.ok(session.active, 'Game session should be active.');
    });

    test('Buy Stock', async () => {
        const boardId = 'some-board-id';
        const stockId = 'some-stock-id';
        await assert.doesNotReject(async () => {
            await businessLogic.buy_stock(boardId, stockId, 'AAPL', 10);
        }, 'Buying stock should not throw errors.');
    });

    test('Sell Stock', async () => {
        const boardId = 'some-board-id';
        const stockId = 'some-stock-id';
        await assert.doesNotReject(async () => {
            await businessLogic.sell_stock(boardId, stockId, 'AAPL', 5);
        }, 'Selling stock should not throw errors.');
    });
});
