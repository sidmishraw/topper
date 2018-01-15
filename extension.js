// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");

// topper specific import
const Topper = require("./topper.js");

/**
 * Invoked when the extension is activated.
 * @param {any} context
 */
function activate(context) {
  console.log('Congratulations, your extension "topper" is now active!');
  var addTopHeader = vscode.commands.registerCommand("topper.addTopHeader", function() {
    console.log("Topper is going to add header to the active file!");
    Topper.topper.addTopHeader();
    console.log("Your header has been successfully added to the file!");
  });
  context.subscriptions.push(addTopHeader);
}

/**
 * Invoked when the extension is deactivated.
 */
function deactivate() {
  console.log("Topper has been deactivated.");
}

exports.activate = activate;
exports.deactivate = deactivate;
