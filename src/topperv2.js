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
 * topperv2.js
 * @author Sidharth Mishra
 * @description The Topper reworked for profile specific commands.
 * @created Sun Jan 14 2018 23:45:27 GMT-0800 (PST)
 * @copyright 2017 Sidharth Mishra
 * @last-modified Tue Feb 19 2019 19:27:32 GMT-0800 (PST)
 */

const _ = require("lodash");
const async = require("async");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * @typedef {Object} IntrinsicParams
 * @property {Date} createdDate the creation date or timestamp
 * @property {Date} lastModifiedDate the last modified timestamp
 * @property {string} fileName the file name
 * @property {string} fileVersion the file version
 *
 * @typedef {Object} HeaderTemplate
 * @property {number} insertAtRow the row index
 * @property {number} insertAtCol the col index
 * @property {string} headerBegin the beginning of the header
 * @property {string} headerPrefix the end of the header
 * @property {string} headerEnd the end of the header
 * @property {string[]} template the lines of the header template
 *
 * @typedef {Object} ProfileTemplates
 */

/**
 * Marker constant for insert at row index.
 * @typedef {string}
 */
const INSERT_AT_ROW = "insertAtRow";

/**
 * Marker constant for insert at col index.
 * @typedef {string}
 */
const INSERT_AT_COL = "insertAtCol";

/**
 * Adds the top header for the specific profile.
 * @param {string} profileName The desired profile.
 */
const addTopHeaderForProfile = profileName => {
    const workspace = vscode.workspace; // the workspace reference from VSCode API

    const editor = vscode.window.activeTextEditor; // the editor reference from VSCode API

    if (!editor || !workspace) return;

    let { filePath, fileName, fileVersion, languageId } = fetchFileMetadata(editor.document);

    const intrinsicParams = {
        createdDate: null,
        lastModifiedDate: null,
        fileName: fileName,
        fileVersion: fileVersion
    };

    let topperTemplates = workspace.getConfiguration("topper").get("headerTemplates");

    let profiles = workspace.getConfiguration("topper").get("customTemplateParameters");

    profiles = _.filter(profiles, p => Object.getOwnPropertyNames(p)[0] === profileName);

    if (profiles.length < 1) return;

    let profileTemplates = profiles[0][profileName];

    let selectedHeaderTemplate = getSelectedHeaderTemplate(topperTemplates, languageId);

    async.waterfall(
        [
            cbk => cbk(null, filePath, intrinsicParams, profileTemplates, editor, selectedHeaderTemplate),
            fetchTimeIntrinsicParams,
            makeHeaderString,
            publishHeaderString
        ],
        (err, cbk) => {
            if (err) console.error(err);
            else if (cbk) cbk(null, "done");
        }
    );
};

/**
 * Makes the header string from the selected template profile and the selected header template
 * @param {any} editor The editor object from VSCode API.
 * @param {SelectedHeaderTemplate} selectedHeaderTemplate  The selected header template.
 * @param {ProfileTemplates} selectedTemplateParams  The template parameters from the selected profile.
 * @param {IntrinsicParams} intrinsicParams Topper's intrinsic parameters.
 * @param {Function} cbk The callback function, generally publishHeaderString
 */
const makeHeaderString = (editor, selectedHeaderTemplate, selectedTemplateParams, intrinsicParams, cbk) => {
    let headerTemplateLines = selectedHeaderTemplate["template"];

    let headerLines = []; // contains the header lines

    headerTemplateLines.forEach(templateLine => {
        let templates = templateLine.split(" ");

        let headerLine = [];

        templates.forEach(template => {
            if (!template.startsWith("${")) {
                headerLine.push(template);
                return;
            }

            let templateName = template.match(/\$\{(.*)\}/)[1];
            let templateValue = "";

            if (templateName in selectedTemplateParams) {
                // the template property name in the selected profile template parameters
                //
                templateValue = selectedTemplateParams[templateName];
            } else if (templateName in selectedHeaderTemplate) {
                // the template property name in the selected header template
                //
                templateValue = selectedHeaderTemplate[templateName];
            } else if (templateName in intrinsicParams) {
                // the intrinsic parameters
                //
                templateValue = intrinsicParams[templateName];
            }

            templateValue = templateValue.toString().replace(/\n/g, `\n${selectedHeaderTemplate["headerPrefix"]}`);

            headerLine.push(templateValue);
        });

        headerLines.push(headerLine.join(" "));
    });

    let rowIndex =
        Number.isSafeInteger(selectedHeaderTemplate[INSERT_AT_ROW]) && selectedHeaderTemplate[INSERT_AT_ROW] > -1
            ? selectedHeaderTemplate[INSERT_AT_ROW]
            : 0; // default first row
    let colIndex =
        Number.isSafeInteger(selectedHeaderTemplate[INSERT_AT_COL]) && selectedHeaderTemplate[INSERT_AT_COL] > -1
            ? selectedHeaderTemplate[INSERT_AT_COL]
            : 0; // default first col

    cbk(null, editor, rowIndex, colIndex, headerLines.join("\n"));
};

/**
 * Publishes the headerString to the text editor. It writes the header to the active text editor at the topmost position.
 * @param {any} editor The reference to the editor from VSCode API.
 * @param {number} rowIndex the row index to publish the header at
 * @param {number} colIndex the column index to publish the header at
 * @param {string} headerString The generated header string to publish.
 * @param {Function} cbk  The callback function.
 */
const publishHeaderString = (editor, rowIndex, colIndex, headerString, cbk) => {
    editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(rowIndex, colIndex), `${headerString}\n\n`);
    });

    cbk(null, null);
};

/**
 * Fetches the time related intrinsic parameters -- creation time and last modified times
 * from the underlying OS.
 * @param {string} filePath The file path from OS.
 * @param {IntrinsicParams} intrinsicParams Topper intrinsic parameters.
 * @param {any[]} profileTemplates The templates and their values defined for the profile.
 * @param {any} editor The VSCode editor object from API.
 * @param {any} selectedHeaderTemplate The selected header template.
 * @param {Function} callback The callback function.
 */
const fetchTimeIntrinsicParams = (filePath, intrinsicParams, profileTemplates, editor, selectedHeaderTemplate, callback) => {
    fs.stat(filePath, (error, stats) => {
        if (error) {
            intrinsicParams["createdDate"] = new Date();
            intrinsicParams["lastModifiedDate"] = new Date();
        } else {
            intrinsicParams["createdDate"] = stats.birthtime;
            intrinsicParams["lastModifiedDate"] = stats.mtime;
        }

        callback(null, editor, selectedHeaderTemplate, profileTemplates, intrinsicParams);
    });
};

/**
 * Fetches the selected header template depending on the file's language.
 * @param {HeaderTemplate[]} topperTemplates The list of all header templates defined in the settings.
 * @param {string} languageId The ID assigned by VSCode for the language of the file.
 * @returns {HeaderTemplate} The selected header template.
 */
const getSelectedHeaderTemplate = (topperTemplates, languageId) => {
    let matches = _.filter(
        topperTemplates,
        t => Object.getOwnPropertyNames(t)[0] && Object.getOwnPropertyNames(t)[0].toLowerCase() === languageId.toLowerCase()
    );

    if (matches.length === 0) return getDefaultHeaderTemplate(topperTemplates);
    else return matches[0][languageId];
};

/**
 * Gets the default header template.
 * @param {HeaderTemplate[]} topperTemplates the list of header templates
 * @returns {HeaderTemplate} the default header template
 */
const getDefaultHeaderTemplate = topperTemplates => {
    let matches = _.filter(topperTemplates, template => template["defaultCStyled"] != null && template["defaultCStyled"] != undefined);
    return matches[0]["defaultCStyled"];
};

/**
 * Fetches the metadata information from VSCode document.
 * @param {any} document The VSCode document reference using the API.
 * @returns {{filePath:string, fileName:string, fileVersion:string, languageId:string}} The metadata object.
 */
const fetchFileMetadata = document => {
    return {
        filePath: document.uri.fsPath,
        fileName: path.parse(document.uri.fsPath).base,
        fileVersion: document.version,
        languageId: document.languageId
    };
};

exports.addTopHeaderForProfile = addTopHeaderForProfile;
