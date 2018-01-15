/**
 * utils.js
 * @author Sidharth Mishra
 * @description Topper utility functions.
 * @created Sun Jan 14 2018 21:37:48 GMT-0800 (PST)
 * @copyright 2017 Sidharth Mishra
 * @last-modified Sun Jan 14 2018 21:37:58 GMT-0800 (PST)
 */

//==============================================================================================

const vscode = require("vscode");

//==============================================================================================

const LOGGING_MODE_DEBUG = "debug";
const LOGGING_MODE_INFO = "info";
const LOGGING_MODE_NONE = "none";

//==============================================================================================

/**
 * This represents the logger's mode. It can be set to either of:
 * 1. utils.LOGGING_MODE_DEBUG -> debug mode
 * 2. utils.LOGGING_MODE_INFO -> info mode
 * 3. utils.LOGGING_MODE_NONE -> no logging mode
 *
 * Defaults to LOGGING_MODE_INFO
 */
let loggingMode = LOGGING_MODE_INFO;

//==============================================================================================

/**
 * Logging utility function
 * @param {string} message The message to be logged
 */
const loginfo = function(message) {
  if (loggingMode == LOGGING_MODE_DEBUG) vscode.window.showInformationMessage(message);
  else if (loggingMode == LOGGING_MODE_INFO) console.log(message);
};

//==============================================================================================

exports.LOGGING_MODE_DEBUG = LOGGING_MODE_DEBUG;
exports.LOGGING_MODE_INFO = LOGGING_MODE_INFO;
exports.LOGGING_MODE_NONE = LOGGING_MODE_NONE;
exports.loggingMode = loggingMode;
exports.loginfo = loginfo;
