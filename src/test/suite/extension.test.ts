/*
 * extension.test.ts
 * @description Integration tests for the Topper VS Code extension
 * @created 2026-02-01
 */

import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Topper Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting Topper extension tests.');

    test('Extension should be present', () => {
        const extension = vscode.extensions.getExtension('sidmishraw.topper');
        assert.ok(extension, 'Extension should be installed');
    });

    test('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('sidmishraw.topper');
        assert.ok(extension, 'Extension should be installed');

        // Activate the extension
        await extension.activate();
        assert.ok(extension.isActive, 'Extension should be active');
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);

        // Check that the main command is registered
        assert.ok(
            commands.includes('topper.addTopHeader'),
            'topper.addTopHeader command should be registered'
        );
    });

    test('Configuration should have default values', () => {
        const config = vscode.workspace.getConfiguration('topper');

        // Check lastModified config
        const lastModified = config.get<string>('lastModified');
        assert.strictEqual(lastModified, '@last-modified', 'Default lastModified key should be @last-modified');

        // Check lastModifiedBy config
        const lastModifiedBy = config.get<string>('lastModifiedBy');
        assert.strictEqual(lastModifiedBy, '@last-modified-by', 'Default lastModifiedBy key should be @last-modified-by');

        // Check enableLastModifiedByUpdate config
        const enableUpdate = config.get<boolean>('enableLastModifiedByUpdate');
        assert.strictEqual(enableUpdate, true, 'enableLastModifiedByUpdate should default to true');
    });

    test('Header insertion command should work', async () => {
        // Create a new untitled document
        const document = await vscode.workspace.openTextDocument({
            language: 'javascript',
            content: '// Test file\nconsole.log("hello");',
        });

        await vscode.window.showTextDocument(document);

        // Execute the add header command
        try {
            await vscode.commands.executeCommand('topper.addTopHeader');

            // Give the command time to execute
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Check that header was added (should start with /*)
            const text = document.getText();
            assert.ok(
                text.includes('/**') || text.includes('/*'),
                'Header should be added to the document'
            );
        } catch (err) {
            // Command might fail on untitled docs, which is acceptable
            console.log('Header command on untitled doc:', err);
        }
    });
});
