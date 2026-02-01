/*
 *  BSD 3-Clause License
 *
 * Copyright (c) 2018, Sidharth Mishra
 * All rights reserved.
 *
 * topper.test.ts
 * @author Sidharth Mishra
 * @description Unit tests for topper constants and regex patterns
 * @created 2026-02-01
 * @last-modified 2026-02-01
 */

import * as assert from 'assert';
import {
    DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX,
    DEFAULT_LAST_MODIFIED_CAPURE_REGEX,
} from '../topper/topper';

describe('topper regex patterns', () => {
    describe('DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX', () => {
        it('should match C-style comment with @last-modified-by', () => {
            const line = '* @last-modified-by John Doe <john@example.com>';
            const match = line.match(DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX);
            assert.ok(match, 'Should match the line');
            assert.strictEqual(match![1], 'John Doe <john@example.com>');
        });

        it('should match with just a name (no email)', () => {
            const line = '* @last-modified-by sidmishraw';
            const match = line.match(DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX);
            assert.ok(match, 'Should match the line');
            assert.strictEqual(match![1], 'sidmishraw');
        });

        it('should match Python-style comment', () => {
            const line = '# @last-modified-by Jane Smith <jane@test.com>';
            const match = line.match(DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX);
            assert.ok(match, 'Should match the line');
            assert.strictEqual(match![1], 'Jane Smith <jane@test.com>');
        });

        it('should match with extra spaces before @', () => {
            const line = '*   @last-modified-by Test User';
            const match = line.match(DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX);
            assert.ok(match, 'Should match the line');
            assert.strictEqual(match![1], 'Test User');
        });

        it('should match with colon separator', () => {
            const line = '* @last-modified-by: Author Name';
            const match = line.match(DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX);
            assert.ok(match, 'Should match the line');
            assert.strictEqual(match![1], 'Author Name');
        });

        it('should not match @last-modified (date field)', () => {
            const line = '* @last-modified 2026-02-01T10:00:00.000Z-08:00';
            const match = line.match(DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX);
            assert.ok(!match, 'Should NOT match the date field');
        });

        it('should handle Unknown fallback user', () => {
            const line = '* @last-modified-by Unknown <unknown-user@example.com>';
            const match = line.match(DEFAULT_LAST_MODIFIED_BY_CAPTURE_REGEX);
            assert.ok(match, 'Should match the line');
            assert.strictEqual(match![1], 'Unknown <unknown-user@example.com>');
        });
    });

    describe('DEFAULT_LAST_MODIFIED_CAPURE_REGEX (existing date regex)', () => {
        it('should match ISO date format', () => {
            const line = '* @last-modified 2026-02-01T10:00:00.000Z-08:00';
            const match = line.match(DEFAULT_LAST_MODIFIED_CAPURE_REGEX);
            assert.ok(match, 'Should match the line');
            assert.strictEqual(match![1], '2026-02-01T10:00:00.000Z-08:00');
        });

        it('should not match @last-modified-by field', () => {
            const line = '* @last-modified-by John Doe';
            const match = line.match(DEFAULT_LAST_MODIFIED_CAPURE_REGEX);
            assert.ok(!match, 'Should NOT match the by field');
        });
    });
});
