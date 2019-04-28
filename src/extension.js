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
 * extension.js
 * @author Sidharth Mishra
 * @created Tue Feb 19 2019 17:04:35 GMT-0800 (PST)
 * @last-modified Sun Apr 07 2019 19:04:32 GMT-0700 (PDT)
 */

//
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//
var vscode = require("vscode");
const _ = require("lodash");

// topper specific import
//
const topper2 = require("./topperv2");
const topperWatcher = require("./topper-watcher"); //  the watcher that watches for changes in files.

/**
 * Invoked when the extension is activated.
 * @param {any} context
 */
function activate(context) {
    console.log('Congratulations, your extension "topper" is now active!');

    topperWatcher.startWatcher();

    let profiles = vscode.workspace.getConfiguration("topper").get("customTemplateParameters");

    _.forEach(profiles, p =>
        context.subscriptions.push(
            vscode.commands.registerCommand(`topper.addTopHeader.${Object.getOwnPropertyNames(p)[0]}`, () =>
                topper2.addTopHeaderForProfile(Object.getOwnPropertyNames(p)[0])
            )
        )
    );
}

/**
 * Invoked when the extension is deactivated.
 */
function deactivate() {
    console.log("Topper has been deactivated.");
}

exports.activate = activate;
exports.deactivate = deactivate;
