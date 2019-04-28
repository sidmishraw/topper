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
 * topper.js
 * @author sidmishraw < sidharth.mishra@sjsu.edu >
 * @description Extension specific logic goes here.
 * @created Sat Jul 01 2017 12:04:03 GMT-0700 (PDT)
 * @copyright None
 * @last-modified Tue Feb 19 2019 19:12:00 GMT-0800 (PST)
 */

//
// VSCODE IMPORTS
//
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const async = require("async");

//
// TOPPER UTILS
//
const utils = require("./utils");

//
// TOPPER SPECIFIC CONSTANTS
//
const TOPPER = "topper";
const TOPPER_CUSTOM_TEMPLATE_PARAMETERS = "customTemplateParameters";
const TOPPER_HEADER_TEMPLATES = "headerTemplates";
const TEMPLATE = "template";
const DEFAULT_HEADER_TEMPLATE = "defaultCStyled";
// const HEADER_BEGIN = "headerBegin";
const HEADER_PREFIX = "headerPrefix";
// const HEADER_END = "headerEnd";

/**
 * the row index where to insert the header at.
 */
const INSERT_AT_ROW = "insertAtRow";

/**
 * the column index where to insert the header at.
 */
const INSERT_AT_COL = "insertAtCol";

//
// VSCODE APIS
//
const window = vscode.window;
const workspace = vscode.workspace;

// the default row and col indices.
//
let rowIndex = 0;
let columnIndex = 0;

/**
 * Fetches the time related intrinsic parameters -- creation time and last modified times
 * from the underlying OS.
 * @param {string} filePath The file path from OS.
 * @param {{createdDate: Date,lastModifiedDate: Date,fileName: string,fileVersion: string}} intrinsicParams Topper intrinsic parameters.
 * @param {any[]} profiles The list of all the profile objects defined by the user.
 * @param {any} editor The VSCode editor object from API.
 * @param {{}} selectedHeaderTemplate The selected header template.
 * @param {Function} callback The callback function.
 */
function fetchTimeIntrinsicParams(filePath, intrinsicParams, profiles, editor, selectedHeaderTemplate, callback) {
    fs.stat(filePath, (error, stats) => {
        if (error) {
            utils.loginfo(`ERROR:: ${JSON.stringify(error)}`);
            intrinsicParams["createdDate"] = new Date();
            intrinsicParams["lastModifiedDate"] = new Date();
        } else {
            utils.loginfo(`Stats received from the OS: ${JSON.stringify(stats)}`);
            intrinsicParams["createdDate"] = stats.birthtime;
            intrinsicParams["lastModifiedDate"] = stats.mtime;
        }
        callback(null, profiles, editor, selectedHeaderTemplate, intrinsicParams);
    });
}

/**
 * Fetches the metadata information from VSCode document.
 * @param {any} document The VSCode document.
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

/**
 * Fetches the selected header template depending on the file's language.
 * @param {{ "[languageId]": {headerBegin: string,headerPrefix:string,headerEnd: string,template: string[]}}[]} topperTemplates The list of all header templates defined in the settings.
 * @param {string} languageId The ID assigned by VSCode for the language of the file.
 * @returns {{}}The selected header template.
 */
const getSelectedHeaderTemplate = (topperTemplates, languageId) => {
    let matches = _.filter(
        topperTemplates,
        t => Object.getOwnPropertyNames(t)[0] && Object.getOwnPropertyNames(t)[0].toLowerCase() === languageId.toLowerCase()
    );

    if (matches.length === 0) return topperTemplates[0][DEFAULT_HEADER_TEMPLATE];
    else return matches[0][languageId];
};

/**
 * The command addTopHeader adds the configured header to the active file.
 */
const addTopHeader = () => {
    const editor = vscode.window.activeTextEditor;
    if (!workspace || !editor) {
        utils.loginfo(`Situation doesn't look all that well, not going to load the extension! Workspace: ${workspace}; Editor: ${editor}`);
        return;
    }
    let { filePath, fileName, fileVersion, languageId } = fetchFileMetadata(editor.document);
    const intrinsicParams = {
        createdDate: null,
        lastModifiedDate: null,
        fileName: fileName,
        fileVersion: fileVersion
    };

    let profiles = workspace.getConfiguration(TOPPER).get(TOPPER_CUSTOM_TEMPLATE_PARAMETERS); // the custom profile templates

    let topperTemplates = workspace.getConfiguration(TOPPER).get(TOPPER_HEADER_TEMPLATES);

    utils.loginfo(`FileName: ${fileName}; FileVersion: ${fileVersion}; Language: ${languageId}`);

    utils.loginfo(`${TOPPER_CUSTOM_TEMPLATE_PARAMETERS} from configuration: ${JSON.stringify(profiles)}`);

    utils.loginfo(`TopperTemplates from configuration: ${JSON.stringify(topperTemplates)}`);

    let selectedHeaderTemplate = getSelectedHeaderTemplate(topperTemplates, languageId);

    utils.loginfo(`\n\nSelected Header Template:: ${JSON.stringify(selectedHeaderTemplate)}`);

    async.waterfall(
        [cbk => cbk(null, filePath, intrinsicParams, profiles, editor, selectedHeaderTemplate), fetchTimeIntrinsicParams, selectProfile],
        (err, cbk) => {
            if (err) console.error(err);
            else if (cbk) cbk(null, "done");
        }
    );
};

/**
 * Displays all the profiles to the user and prompts them to select one.
 * @param {any[]} profiles
 * @param {any} editor
 * @param {{headerBegin: string,headerPrefix:string,headerEnd: string,template: string[]}} selectedHeaderTemplate
 * @param {{createdDate: Date,lastModifiedDate: Date,fileName: string,fileVersion: string}} intrinsicParams
 * @param {Function} cbk
 */
const selectProfile = (profiles, editor, selectedHeaderTemplate, intrinsicParams, cbk) => {
    let customProfiles = new Map();

    let customProfileNames = [];

    // create the list of all the profile names for the selection menu
    //
    let x = profiles.flatMap(p => [p.e]);
    x.forEach(e => console.log(e));

    forEach(profile => {
        for (let e in profile) {
            customProfiles.set(e, profile[e]);
            customProfileNames.push(e);
        }
    });

    utils.loginfo(`Profile Names: ${JSON.stringify(customProfileNames)}`);

    window.showInformationMessage("Please select the profile name to apply").then(() => {
        window.showQuickPick(customProfileNames).then(selectedProfileName => {
            utils.loginfo(`User selected profile: ${selectedProfileName}`);
            let selectedTemplateParams = customProfiles.get(selectedProfileName);
            utils.loginfo(`Selected Params: ${JSON.stringify(selectedTemplateParams)}`);
            makeHeaderString(editor, selectedHeaderTemplate, selectedTemplateParams, intrinsicParams);
        });
    });
    cbk(null, null); // done
};

exports.addTopHeader = addTopHeader;
