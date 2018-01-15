/**
 * topper.js
 *
 * @author sidmishraw < sidharth.mishra@sjsu.edu >
 * @description Extension specific logic goes here.
 * @created Sat Jul 01 2017 12:04:03 GMT-0700 (PDT)
 * @copyright None
 * @last-modified Sun Jul 02 2017 14:31:52 GMT-0700 (PDT)
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

//
// VSCODE APIS
//
const window = vscode.window;
const workspace = vscode.workspace;

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
function fetchTimeIntrinsicParams(
  filePath,
  intrinsicParams,
  profiles,
  editor,
  selectedHeaderTemplate,
  callback
) {
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
    t =>
      Object.getOwnPropertyNames(t)[0] &&
      Object.getOwnPropertyNames(t)[0].toLowerCase() === languageId.toLowerCase()
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
    utils.loginfo(
      `Situation doesn't look all that well, not going to load the extension! Workspace: ${workspace}; Editor: ${editor}`
    );
    return;
  }
  let { filePath, fileName, fileVersion, languageId } = fetchFileMetadata(
    editor.document
  );
  const intrinsicParams = {
    createdDate: null,
    lastModifiedDate: null,
    fileName: fileName,
    fileVersion: fileVersion
  };

  let profiles = workspace
    .getConfiguration(TOPPER)
    .get(TOPPER_CUSTOM_TEMPLATE_PARAMETERS); // the custom profile templates

  let topperTemplates = workspace.getConfiguration(TOPPER).get(TOPPER_HEADER_TEMPLATES);
  utils.loginfo(
    `FileName: ${fileName}; FileVersion: ${fileVersion}; Language: ${languageId}`
  );
  utils.loginfo(
    `${TOPPER_CUSTOM_TEMPLATE_PARAMETERS} from configuration: ${JSON.stringify(profiles)}`
  );
  utils.loginfo(`TopperTemplates from configuration: ${JSON.stringify(topperTemplates)}`);
  let selectedHeaderTemplate = getSelectedHeaderTemplate(topperTemplates, languageId);
  utils.loginfo(
    `\n\nSelected Header Template:: ${JSON.stringify(selectedHeaderTemplate)}`
  );
  async.waterfall(
    [
      cbk =>
        cbk(null, filePath, intrinsicParams, profiles, editor, selectedHeaderTemplate),
      fetchTimeIntrinsicParams,
      selectProfile
    ],
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
const selectProfile = (
  profiles,
  editor,
  selectedHeaderTemplate,
  intrinsicParams,
  cbk
) => {
  let customProfiles = new Map();
  let customProfileNames = [];
  // create the list of all the profile names for the selection menu
  profiles.forEach(profile => {
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
      makeHeaderString(
        editor,
        selectedHeaderTemplate,
        selectedTemplateParams,
        intrinsicParams
      );
    });
  });
  cbk(null, null); // done
};

/**
 * Makes the header string from the selected template profile and the selected header template
 * @param {any} selectedTemplateParams the template parameters of the selected template profile
 * @param {Function} callback the function to do after initial setup is done
 */
function makeHeaderString(
  editor,
  selectedHeaderTemplate,
  selectedTemplateParams,
  intrinsicParams
) {
  let headerTemplateLines = selectedHeaderTemplate[TEMPLATE];
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
        .replace(/\n/g, `\n${selectedHeaderTemplate[HEADER_PREFIX]}`);
      headerLine.push(templateValue);
    });
    headerLines.push(headerLine.join(" "));
  });
  utils.loginfo(`Header String: ${headerLines.join("\n")}`);
  publishHeaderString(editor, headerLines.join("\n"));
}

/**
 * Publishes the headerString to the text editor. It writes the header to the active text editor at the topmost position.
 *
 * @param {string} headerString the header string made after replacing all the templates with their values.
 */
function publishHeaderString(editor, headerString) {
  utils.loginfo("Publishing to the document");
  editor.edit(editBuilder => {
    editBuilder.insert(new vscode.Position(0, 0), `${headerString}\n\n`);
  });
}

exports.addTopHeader = addTopHeader;
