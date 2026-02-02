/*
 *  BSD 3-Clause License
 *
 * Copyright (c) 2018, Sidharth Mishra
 * All rights reserved.
 *
 * userinfo.test.ts
 * @author Sidharth Mishra
 * @description Unit tests for userinfo utility module
 * @created 2026-02-01
 * @last-modified 2026-02-01
 */

import * as assert from 'assert';
import { formatUserInfo, getCurrentUserInfo, UserInfo } from '../util/userinfo';

describe('userinfo', () => {
    describe('formatUserInfo', () => {
        it('should format user with name and email', () => {
            const user: UserInfo = { name: 'John Doe', email: 'john@example.com' };
            const result = formatUserInfo(user);
            assert.strictEqual(result, 'John Doe <john@example.com>');
        });

        it('should format user with name only (no email)', () => {
            const user: UserInfo = { name: 'JaneDoe' };
            const result = formatUserInfo(user);
            assert.strictEqual(result, 'JaneDoe');
        });

        it('should handle empty email string as no email', () => {
            const user: UserInfo = { name: 'Test User', email: '' };
            const result = formatUserInfo(user);
            // Empty string is falsy, so should return just the name
            assert.strictEqual(result, 'Test User');
        });

        it('should handle special characters in name', () => {
            const user: UserInfo = { name: "O'Brien", email: 'obrien@test.com' };
            const result = formatUserInfo(user);
            assert.strictEqual(result, "O'Brien <obrien@test.com>");
        });

        it('should handle unicode characters in name', () => {
            const user: UserInfo = { name: '日本語', email: 'user@test.com' };
            const result = formatUserInfo(user);
            assert.strictEqual(result, '日本語 <user@test.com>');
        });
    });

    describe('getCurrentUserInfo', () => {
        it('should return a UserInfo object', async () => {
            const result = await getCurrentUserInfo();
            assert.ok(result, 'Result should not be null or undefined');
            assert.ok(typeof result.name === 'string', 'Name should be a string');
            assert.ok(result.name.length > 0, 'Name should not be empty');
        });

        it('should return at minimum the default fallback', async () => {
            // Even in the worst case, we should get the default user
            const result = await getCurrentUserInfo();
            assert.ok(result.name, 'Should have a name');
            // Name should be either from git, OS, or 'Unknown'
            assert.ok(
                result.name !== '' && result.name !== null && result.name !== undefined,
                'Name should be non-empty'
            );
        });

        it('should handle invalid working directory gracefully', async () => {
            // Pass a non-existent directory - should not throw, should fallback
            const result = await getCurrentUserInfo('/nonexistent/path/that/does/not/exist');
            assert.ok(result, 'Should return a result even with invalid path');
            assert.ok(result.name, 'Should have a name');
        });
    });
});
