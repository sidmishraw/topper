/**
 * topperv2.js
 * @author Sidharth Mishra
 * @description The Topper reworked for profile specific commands.
 * @created Sun Jan 14 2018 23:45:27 GMT-0800 (PST)
 * @copyright 2017 Sidharth Mishra
 * @last-modified Sun Jan 14 2018 23:45:27 GMT-0800 (PST)
 */

//==============================================================================================
const _ = require("lodash");
const async = require("async");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
//==============================================================================================

/**
 * @typedef {{createdDate: Date,lastModifiedDate: Date,fileName: string,fileVersion: string}} IntrinsicParams
 *
 * @typedef {{headerBegin: string,headerPrefix:string,headerEnd: string,template: string[]}} SelectedHeaderTemplate
 *
 * @typedef {Object} ProfileTemplates
 */

/**
 * Adds the top header for the specific profile.
 * @param {string} profileName The desired profile.
 */
const addTopHeaderForProfile = profileName => {
  const workspace = vscode.workspace; // the workspace reference from VSCode API
  const editor = vscode.window.activeTextEditor; // the editor reference from VSCode API
  if (!editor || !workspace) return;
  let { filePath, fileName, fileVersion, languageId } = fetchFileMetadata(
    editor.document
  );
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
      cbk =>
        cbk(
          null,
          filePath,
          intrinsicParams,
          profileTemplates,
          editor,
          selectedHeaderTemplate
        ),
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

//==============================================================================================

/**
 * Makes the header string from the selected template profile and the selected header template
 * @param {any} editor The editor object from VSCode API.
 * @param {SelectedHeaderTemplate} selectedHeaderTemplate  The selected header template.
 * @param {ProfileTemplates} selectedTemplateParams  The template parameters from the selected profile.
 * @param {IntrinsicParams} intrinsicParams Topper's intrinsic parameters.
 * @param {Function} cbk The callback function, generally publishHeaderString
 */
const makeHeaderString = (
  editor,
  selectedHeaderTemplate,
  selectedTemplateParams,
  intrinsicParams,
  cbk
) => {
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
        templateValue = selectedTemplateParams[templateName];
      } else if (templateName in selectedHeaderTemplate) {
        templateValue = selectedHeaderTemplate[templateName];
      } else if (templateName in intrinsicParams) {
        templateValue = intrinsicParams[templateName];
      }
      templateValue = templateValue
        .toString()
        .replace(/\n/g, `\n${selectedHeaderTemplate["headerPrefix"]}`);
      headerLine.push(templateValue);
    });
    headerLines.push(headerLine.join(" "));
  });
  cbk(null, editor, headerLines.join("\n"));
};

//==============================================================================================

/**
 * Publishes the headerString to the text editor. It writes the header to the active text editor at the topmost position.
 * @param {any} editor The reference to the editor from VSCode API.
 * @param {string} headerString The generated header string to publish.
 * @param {Function} cbk  The callback function.
 */
const publishHeaderString = (editor, headerString, cbk) => {
  editor.edit(editBuilder => {
    editBuilder.insert(new vscode.Position(0, 0), `${headerString}\n\n`);
  });
  cbk(null, null);
};

//==============================================================================================

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
const fetchTimeIntrinsicParams = (
  filePath,
  intrinsicParams,
  profileTemplates,
  editor,
  selectedHeaderTemplate,
  callback
) => {
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

//==============================================================================================

/**
 * Fetches the selected header template depending on the file's language.
 * @param {{ "[languageId]": {headerBegin: string,headerPrefix:string,headerEnd: string,template: string[]}}[]} topperTemplates The list of all header templates defined in the settings.
 * @param {string} languageId The ID assigned by VSCode for the language of the file.
 * @returns {SelectedHeaderTemplate} The selected header template.
 */
const getSelectedHeaderTemplate = (topperTemplates, languageId) => {
  let matches = _.filter(
    topperTemplates,
    t =>
      Object.getOwnPropertyNames(t)[0] &&
      Object.getOwnPropertyNames(t)[0].toLowerCase() === languageId.toLowerCase()
  );
  if (matches.length === 0) return topperTemplates[0]["defaultCStyled"];
  else return matches[0][languageId];
};

//==============================================================================================

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

//==============================================================================================

exports.addTopHeaderForProfile = addTopHeaderForProfile;
