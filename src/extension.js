//==============================================================================================

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");
const _ = require("lodash");

//==============================================================================================

// topper specific import
const topper = require("./topper");
const topper2 = require("./topperv2");
const topperWatcher = require("./topper-watcher"); //  the watcher that watches for changes in files.

//==============================================================================================

/**
 * Invoked when the extension is activated.
 * @param {any} context
 */
function activate(context) {
  console.log('Congratulations, your extension "topper" is now active!');
  //==============================================================================================
  topperWatcher.startWatcher();
  //==============================================================================================
  var addTopHeader = vscode.commands.registerCommand("topper.addTopHeader", function() {
    console.log("Topper is going to add header to the active file!");
    topper.addTopHeader();
    console.log("Your header has been successfully added to the file!");
  });
  context.subscriptions.push(addTopHeader);
  //==============================================================================================
  let profiles = vscode.workspace
    .getConfiguration("topper")
    .get("customTemplateParameters");
  _.forEach(profiles, p =>
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `topper.addTopHeader.${Object.getOwnPropertyNames(p)[0]}`,
        () => topper2.addTopHeaderForProfile(Object.getOwnPropertyNames(p)[0])
      )
    )
  );
  //==============================================================================================
}

/**
 * Invoked when the extension is deactivated.
 */
function deactivate() {
  if (topperWatcher.fileWatcherListener) topperWatcher.fileWatcherListener.dispose();
  console.log("Topper has been deactivated.");
}

exports.activate = activate;
exports.deactivate = deactivate;
