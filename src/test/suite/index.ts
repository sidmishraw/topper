/*
 * index.ts
 * @description Test suite loader for VS Code extension tests
 * @created 2026-02-01
 */

import * as path from 'path';
import * as Mocha from 'mocha';
import * as fs from 'fs';

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000, // Extension tests may need more time
    });

    const testsRoot = path.resolve(__dirname, '.');

    // Find all test files using fs
    const files = fs.readdirSync(testsRoot).filter((file) => file.endsWith('.test.js'));

    // Add files to the test suite
    for (const f of files) {
        mocha.addFile(path.resolve(testsRoot, f));
    }

    // Run the mocha test
    return new Promise((resolve, reject) => {
        mocha.run((failures: number) => {
            if (failures > 0) {
                reject(new Error(`${failures} tests failed.`));
            } else {
                resolve();
            }
        });
    });
}
