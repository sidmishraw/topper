/**
 * topper-watcher.js
 * @author Sidharth Mishra
 * @description Watches the files that had topper add headers.
 * @created Mon Jan 15 2018 15:51:52 GMT-0800 (PST)
 * @copyright 2017 Sidharth Mishra
 * @last-modified Tue Jan 16 2018 12:09:24 GMT-0800 (PST)
 */

//==============================================================================================

const vscode = require("vscode");
const async = require("async");
const _ = require("lodash");

//==============================================================================================

/**
 * From VSCode API
 * @typedef {Range} Range
 */
const Range = vscode.Range;

/**
 * From VSCode API
 * @typedef {Position} Position
 */
const Position = vscode.Position;

//==============================================================================================

/**
 * @typedef {Workspace} Workspace
 */

//==============================================================================================

/**
 * The ChangeEvent listener for the FileSystemWatcher.
 */
let fileWatcherListener = null;

/**
 * Starts the FileSystemWatcher to check for onChange events.
 */
const startWatcher = () => {
  const workspace = vscode.workspace;
  const fileWatcher = workspace.createFileSystemWatcher("**/*");
  if (!fileWatcher || fileWatcher == undefined || fileWatcher == null) return; // null check
  fileWatcherListener = fileWatcher.onDidChange(changedFileUri => {
    // console.log(`File has changed!`);
    async.waterfall(
      [cbk => cbk(null, workspace, changedFileUri), updateLastModifiedDate],
      (err, cbk) => {
        if (err) return;
        else if (cbk) cbk("done");
      }
    );
  });
};

//==============================================================================================

/**
 * Updates the last-modified date section of the topper header.
 * @param {Workspace} workspace The reference to the workspace from VS Code API.
 * @param {string} filePath The file path.
 * @param {Function} cbk The callback function.
 */
const updateLastModifiedDate = (workspace, filePath, cbk) => {
  workspace
    .openTextDocument(filePath)
    .then(mdFile => {
      let lines = mdFile.getText().split(/\n/);
      let lastModifiedKey = vscode.workspace
        .getConfiguration("topper")
        .get("lastModified");
      //Tue Jan 16 2018 11:39:37 GMT-0800 (PST)
      const regex = new RegExp(
        `[ ]*${lastModifiedKey}\\:{0,1}\\s+([A-Za-z]{3} [A-Za-z]{3} [0-9]{2} [0-9]{4} [0-9]{2}\\:[0-9]{2}\\:[0-9]{2} [A-Za-z]{3}\\-[0-9]{4} \\([A-Za-z]{3,}\\))\\n*`
      ); // the regex
      let matches = _.filter(lines, l => l.match(regex)); //l.match(/\@last\-modified\:{0,1}\s+(.*)\n*/i));
      if (!matches || (matches && matches.length < 1)) return; // no topper header present with last-updated field
      let lmdDateLineNbr = lines.indexOf(matches[0]);
      let matchText = matches[0].match(regex)[1]; //match(/\@last\-modified\:{0,1}\s+(.*)\n*/i)[1];
      let rplcStartIndex = matches[0].indexOf(matchText); // start index of match
      let rplcEndIndex = rplcStartIndex + matchText.length; // end index of the area to replace
      let replaceRange = new Range(
        new Position(lmdDateLineNbr, rplcStartIndex),
        new Position(lmdDateLineNbr, rplcEndIndex)
      );
      const editor = vscode.window.activeTextEditor;
      if (editor.document !== mdFile) return; // the active file is not the modified file
      editor.edit(editBuilder => {
        editBuilder.replace(replaceRange, new Date().toString());
      });
      cbk(null, null);
    })
    .catch(err => console.error(`error :: ${JSON.stringify(err)}`));
};

//==============================================================================================

exports.startWatcher = startWatcher;
exports.fileWatcherListener = fileWatcherListener;
