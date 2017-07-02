// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');

// topper specific import
const Topper = require("./topper.js");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "topper" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var addTopHeader = vscode.commands.registerCommand('extension.addTopHeader', function () {

        // the code below is executed every time the command `topper.addTopHeader` is executed
        console.log("Topper is going to add header to the active file!");

        Topper.topper.addTopHeader();

        console.log("Your header has been successfully added to the file!");
    });

    context.subscriptions.push(addTopHeader);
}

// this method is called when your extension is deactivated
function deactivate() { }

exports.activate = activate;
exports.deactivate = deactivate;