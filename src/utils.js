/*
 *  BSD 3-Clause License
 *
 * Copyright (c) 2018, Sidharth Mishra
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * utils.js
 * @author Sidharth Mishra
 * @description Topper utility functions.
 * @created Sun Jan 14 2018 21:37:48 GMT-0800 (PST)
 * @copyright 2017 Sidharth Mishra
 * @last-modified Tue Feb 19 2019 19:13:06 GMT-0800 (PST)
 */

const vscode = require("vscode");

const LOGGING_MODE_DEBUG = "debug";
const LOGGING_MODE_INFO = "info";
const LOGGING_MODE_NONE = "none";

/**
 * This represents the logger's mode. It can be set to either of:
 * 1. utils.LOGGING_MODE_DEBUG -> debug mode
 * 2. utils.LOGGING_MODE_INFO -> info mode
 * 3. utils.LOGGING_MODE_NONE -> no logging mode
 *
 * Defaults to LOGGING_MODE_INFO
 */
let loggingMode = LOGGING_MODE_INFO;

/**
 * Logging utility function
 * @param {string} message The message to be logged
 */
const loginfo = function(message) {
    if (loggingMode == LOGGING_MODE_DEBUG) vscode.window.showInformationMessage(message);
    else if (loggingMode == LOGGING_MODE_INFO) console.log(message);
};

exports.LOGGING_MODE_DEBUG = LOGGING_MODE_DEBUG;
exports.LOGGING_MODE_INFO = LOGGING_MODE_INFO;
exports.LOGGING_MODE_NONE = LOGGING_MODE_NONE;
exports.loggingMode = loggingMode;
exports.loginfo = loginfo;
