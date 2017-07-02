/**
 * topper.js
 * 
 * Extension specific logic goes here.
 * 
 * @author sidmishraw
 */

(function (topper) {

  "use strict";

  // vscode import
  const vscode = require("vscode");
  const fs = require("fs");
  const path = require("path");

  // for logging
  const LOGGING_MODE_DEBUG = "debug";
  const LOGGING_MODE_INFO = "info";
  const LOGGING_MODE_NONE = "none";

  // topper specific constants
  const TOPPER = "topper";
  const TOPPER_CUSTOM_TEMPLATE_PARAMETERS = "customTemplateParameters";
  const TOPPER_HEADER_TEMPLATES = "headerTemplates";
  const TEMPLATE = "template";
  const DEFAULT_HEADER_TEMPLATE = "defaultCStyled";
  const HEADER_BEGIN = "headerBegin";
  const HEADER_PREFIX = "headerPrefix";
  const HEADER_END = "headerEnd";

  // vscode apis
  const window = vscode.window;
  const workspace = vscode.workspace;

  /**
   * Logging utility
   * 
   * @param {*} message the message to be logged
   */
  let loginfo = function (message) {

    let logginMode = LOGGING_MODE_INFO;

    switch (logginMode) {

      case LOGGING_MODE_DEBUG: {

        window.showInformationMessage(message);
        break;
      }

      case LOGGING_MODE_INFO: {

        console.log(message);
        break;
      }

      case LOGGING_MODE_NONE: {
        // do nothing for now
        break;
      }
    }
  };

  /**
   * Fetches the time related intrinsic parameters -- creation time and last modified times
   * from the underlying OS.
   * 
   * @param {*} callback the callback function that is executed after computation of the intrinsic params
   */
  function fetchTimeIntrinsicParams(filePath, intrinsicParams, callback) {

    fs.stat(filePath, (error, stats) => {

      if (error) {

        loginfo(`ERROR:: ${JSON.stringify(error)}`);

        intrinsicParams["createdDate"] = new Date();
        intrinsicParams["lastModifiedDate"] = new Date();
      } else {

        loginfo(`Stats received from the OS: ${JSON.stringify(stats)}`);

        intrinsicParams["createdDate"] = stats.birthtime;
        intrinsicParams["lastModifiedDate"] = stats.mtime;
      }

      callback();
    });
  }

  /**
   * The command addTopHeader adds the configured header to the active file.
   */
  topper.addTopHeader = function () {

    const editor = vscode.window.activeTextEditor;

    if (!workspace || !editor) {

      loginfo(`Situation doesn't look all that well, not going to load the extension! Workspace: ${workspace}; Editor: ${editor}`);

      return;
    }

    // filename of the active document
    let filePath = editor.document.uri.fsPath;
    let fileName = path.parse(filePath).base;
    let fileVersion = editor.document.version;
    let languageId = editor.document.languageId;

    // topper intrinsic params
    const intrinsicParams = {
      "createdDate": null,
      "lastModifiedDate": null,
      "fileName": fileName,
      "fileVersion": fileVersion
    };

    // custom topper template parameters
    let topperTemplateParams = workspace.getConfiguration(TOPPER).get(TOPPER_CUSTOM_TEMPLATE_PARAMETERS);

    // custom header templates that are language specific
    let topperTemplates = workspace.getConfiguration(TOPPER).get(TOPPER_HEADER_TEMPLATES);

    loginfo(`FileName: ${fileName}; FileVersion: ${fileVersion}; Language: ${languageId}`);
    loginfo(`TopperTemplateParams from configuration: ${JSON.stringify(topperTemplateParams)}`);
    loginfo(`TopperTemplates from configuration: ${JSON.stringify(topperTemplates)}`);

    // choose the header template depending on the languageId of the file
    let selectedHeaderTemplate = (function () {

      let selectedTemplate = null;

      topperTemplates.forEach((headerTemplate) => {

        let templateName = Object.getOwnPropertyNames(headerTemplate)[0];

        if (!templateName) {

          return;
        }

        if (templateName.toLowerCase() === languageId.toLowerCase()) {

          selectedTemplate = headerTemplate[languageId];
        }
      });

      if (!selectedTemplate) {

        selectedTemplate = topperTemplates[0][DEFAULT_HEADER_TEMPLATE];
      }

      return selectedTemplate;
    }());

    loginfo(`\n\nSelected Header Template:: ${JSON.stringify(selectedHeaderTemplate)}`);

    fetchTimeIntrinsicParams(filePath, intrinsicParams, () => {

      let customProfiles = new Map();
      let customProfileNames = [];

      // create the list of all the profile names for the selection menu
      topperTemplateParams.forEach(function (templateParamObject) {

        for (let templateParamElement in templateParamObject) {

          customProfiles.set(templateParamElement, templateParamObject[templateParamElement]);
          customProfileNames.push(templateParamElement);
        }
      });

      loginfo(`Profile Names: ${JSON.stringify(customProfileNames)}`);

      // display the info box for the next step
      window.showInformationMessage("Please select the profile name to apply").then(() => {

        // show the quickpick selection menu to select the profile
        window.showQuickPick(customProfileNames).then((selectedProfileName) => {

          loginfo(`User selected profile: ${selectedProfileName}`);
          let selectedTemplateParams = customProfiles.get(selectedProfileName);

          loginfo(`Selected Params: ${JSON.stringify(selectedTemplateParams)}`);

          makeHeaderString(editor, selectedHeaderTemplate, selectedTemplateParams, intrinsicParams);
        });
      });
    });
  };

  /**
   * Makes the header string from the selected template profile and the selected header template
   * 
   * @param {*} selectedTemplateParams the template parameters of the selected template profile
   * @param {*} callback the function to do after initial setup is done
   */
  function makeHeaderString(editor, selectedHeaderTemplate, selectedTemplateParams, intrinsicParams) {

    let headerTemplateLines = selectedHeaderTemplate[TEMPLATE];

    // contains the header lines
    let headerLines = [];

    headerTemplateLines.forEach((templateLine) => {

      let templates = templateLine.split(" ");
      let headerLine = [];

      templates.forEach((template) => {

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

        templateValue = templateValue.toString().replace(/\n/g, `\n${selectedHeaderTemplate[HEADER_PREFIX]}`);

        headerLine.push(templateValue);
      });

      headerLines.push(headerLine.join(" "));
    });

    loginfo(`Header String: ${headerLines.join("\n")}`);

    publishHeaderString(editor, headerLines.join("\n"));
  }

  /**
   * Publishes the headerString to the text editor. It writes the header to the active text editor at the topmost position.
   * 
   * @param {*} headerString the header string made after replacing all the templates with their values.
   */
  function publishHeaderString(editor, headerString) {

    loginfo("Publishing to the document");

    editor.edit((editBuilder) => {

      editBuilder.insert(new vscode.Position(0, 0), `${headerString}\n\n`);
    });
  }
}(exports.topper = {}));