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
 * service.ts
 * @author Sidharth Mishra
 * @created Sat Apr 27 2019 16:38:51 GMT-0700 (PDT)
 * @last-modified Sun Apr 28 2019 22:25:53 GMT-0700 (PDT)
 */

import * as path from 'path';
import { workspace, window, TextDocument, TextEditor, Position } from 'vscode';
import {
    TextDocumentMetadata,
    TopperProvidedParam,
    TOPPER,
    CUSTOM_TEMPLATE_PARAMETERS,
    HEADER_TEMPLATES,
    HeaderTemplate,
    CustomTemplateParameter,
    getProfileName,
    ProfileTemplate,
    LanguageHeaderTemplate,
    DATE_FORMAT,
    DEFAULT_DATETIME_FORMAT,
    INSERT_AT_ROW,
    INSERT_AT_COL,
    DEFAULT_HEADER_TEMPLATE,
    DEFAULT_LANGUAGE_ID,
} from './topper';
import { Optional } from '../util/optional';
import { stat } from 'fs';
import * as Moment from 'moment';
import * as BlueBird from 'bluebird';
import { createLicenseText, getAsLicenseType } from './license';

/**
 * Adds the top header for the given profile name.
 * @param profileName the profile name.
 */
export function addTopHeader(profileName: string) {
    if (!profileName || profileName.length < 1) {
        console.error('profile name cannot be null or empty!');
        return;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
        console.error("The reference to the TextEditor couldn't be fetched, bailing out...!");
        return;
    }

    const documentMetadata = extractFileMetadata(editor.document);

    const intrinsicParams = new TopperProvidedParam(null, null, documentMetadata.fileName, documentMetadata.fileVersion);

    const headerTemplates: HeaderTemplate[] | undefined = workspace.getConfiguration(TOPPER).get(HEADER_TEMPLATES);
    const customTemplateParameters: CustomTemplateParameter[] | undefined = workspace.getConfiguration(TOPPER).get(CUSTOM_TEMPLATE_PARAMETERS);
    if (!customTemplateParameters || !headerTemplates) {
        console.error("Couldn't load the header templates or custom template parameters!");
        return;
    }

    let selectedTemplateParameter: CustomTemplateParameter | undefined = customTemplateParameters
        .filter(customTemplateParameter => getProfileName(customTemplateParameter) === profileName)
        .find((_, index) => index === 0);

    if (!selectedTemplateParameter) {
        console.info('Selecting the first custom template param in the list since no specific profile was selected!');
        selectedTemplateParameter = customTemplateParameters[0]; // the first custom template parameter is chosen by default
    }

    let profileTemplate: ProfileTemplate = selectedTemplateParameter[profileName];
    if (!profileTemplate) {
        console.error("Couldn't fetch the desired profile template!");
        return;
    }

    let selectedHeaderTemplate: LanguageHeaderTemplate = getSelectedHeaderTemplate(headerTemplates, documentMetadata.languageId);

    const headerLines: string[] = [];

    fetchAndUpdateCreatedAndModifiedDates(intrinsicParams, documentMetadata.filePath)
        .then(() => makeHeaderString(selectedHeaderTemplate, profileTemplate, intrinsicParams, headerLines))
        .then((value: { r: number; c: number }) => publishHeaderString(editor, value.r, value.c, headerLines.join('\n')))
        .catch(err => console.error(err));
}

/**
 * Extracts the metadata from the text document.
 * @param doc the text document being processed by topper
 */
function extractFileMetadata(doc: TextDocument): TextDocumentMetadata {
    return {
        filePath: doc.uri.fsPath,
        fileName: path.parse(doc.uri.fsPath).base,
        fileVersion: doc.version,
        languageId: doc.languageId,
    };
}

/**
 * Gets the selected header template based on the language ID.
 * @param headerTemplates the header templates
 * @param languageId  the language ID
 * @returns the selected header template if found, else returns the default header template.
 */
function getSelectedHeaderTemplate(headerTemplates: HeaderTemplate[], languageId: string): LanguageHeaderTemplate {
    for (let headerTemplate of headerTemplates) {
        for (let key in headerTemplate) {
            if (languageId.toLowerCase() === key.toLowerCase()) {
                return headerTemplate[languageId];
            }
        }
    }
    return getDefaultHeaderTemplate();
}

/**
 * Gets the default header template.
 * @returns the default header template, used mostly for C-styled languages.
 */
function getDefaultHeaderTemplate(): LanguageHeaderTemplate {
    const defaultHeaderTemplate: HeaderTemplate | undefined = workspace.getConfiguration(TOPPER).get(DEFAULT_HEADER_TEMPLATE);
    if (defaultHeaderTemplate) {
        // return the configured default header template if it is available, else
        // fallback to the hard-coded default.
        return defaultHeaderTemplate[DEFAULT_LANGUAGE_ID];
    }
    return new LanguageHeaderTemplate('/**', '*', '*/', [
        '${headerBegin}',
        '${headerPrefix} ${fileName}',
        '${headerPrefix} @author ${author}',
        '${headerPrefix} @description ${description}',
        '${headerPrefix} @created ${createdDate}',
        '${headerPrefix} @copyright ${copyright}',
        '${headerPrefix} @last-modified ${lastModifiedDate}',
        '${headerEnd}',
    ]);
}

/**
 * Given the reference to the intrinsic params and filePath, fetches the created and modified dates from the underlying OS and updates them.
 * @param intrinsicParams the reference to the intrinsic params
 * @param filePath the file path
 * @returns a bluebird promise that signals that intrinsic parameters have been updated.
 */
function fetchAndUpdateCreatedAndModifiedDates(intrinsicParams: TopperProvidedParam, filePath: string): BlueBird<void> {
    return BlueBird.promisify(stat)(filePath).then(fileStats => {
        let dateFormat: string | undefined = workspace.getConfiguration(TOPPER).get(DATE_FORMAT);
        if (!dateFormat) {
            dateFormat = DEFAULT_DATETIME_FORMAT;
        }

        if (!fileStats) {
            let now: string | undefined = Moment().format(dateFormat);
            if (!now) {
                console.error("Couldn't fetch the last modified datetime!");
                return;
            }
            intrinsicParams.createdDate = now;
            intrinsicParams.lastModifiedDate = now;
        } else {
            const createdDateTime: Date = fileStats.birthtime;
            const modifiedDateTime: Date = fileStats.mtime;

            intrinsicParams.createdDate = Moment(createdDateTime).format(dateFormat);
            intrinsicParams.lastModifiedDate = Moment(modifiedDateTime).format(dateFormat);
        }
    });
}

/**
 * Makes the header string and populates the headerLines.
 * @param selectedHeaderTemplate the reference to the language specific header template
 * @param selectedTemplateParameter the profile specific template parameters
 * @param intrinsicParams the instrinsic parameters provided by topper
 * @param headerLines the array containing all the header lines
 * @returns the BlueBird promise that is void, i.e a supplier, used to signify that the async task has completed.
 */
function makeHeaderString(
    selectedHeaderTemplate: LanguageHeaderTemplate,
    selectedTemplateParameter: ProfileTemplate,
    intrinsicParams: TopperProvidedParam,
    headerLines: string[]
): BlueBird<{ r: number; c: number }> {
    const template = selectedHeaderTemplate.template;

    template.forEach(templateLine => {
        let tokens = templateLine.split(' '); // list of all the tokens in the template line
        let headerLine: string[] = [];

        tokens.filter(token => {
            if (!token.startsWith('${')) {
                headerLine.push(token);
                return;
            }

            let tokenName: string = Optional.ofNullable(token.match(/\$\{(.*)\}/))
                .map(match => {
                    if (match) return match[1];
                })
                .orElse(token);

            let tokenValue: string = '';

            let author: string | undefined = selectedTemplateParameter['author'];
            if (!author) author = "Author's Full Name goes here";

            if (tokenName in selectedTemplateParameter) {
                // if the token name is present in the profile specific template parameters
                tokenValue = selectedTemplateParameter[tokenName];
                if (tokenName === 'license') {
                    // special handling for creating license text
                    // get the license text for given license type
                    //
                    let licenseText = createLicenseText(author, getAsLicenseType(tokenValue));
                    tokenValue = licenseText;
                }
            } else if (tokenName in selectedHeaderTemplate) {
                // if the token name is present in the language specific header templates
                switch (tokenName) {
                    case 'headerBegin':
                        tokenValue = selectedHeaderTemplate.headerBegin;
                        break;
                    case 'headerPrefix':
                        tokenValue = selectedHeaderTemplate.headerPrefix;
                        break;
                    case 'headerEnd':
                        tokenValue = selectedHeaderTemplate.headerEnd;
                        break;
                    default:
                        tokenValue = token;
                        break;
                }
            } else if (tokenName in intrinsicParams) {
                switch (tokenName) {
                    case 'createdDate':
                        tokenValue = intrinsicParams.createdDate;
                        break;
                    case 'fileName':
                        tokenValue = intrinsicParams.fileName;
                        break;
                    case 'fileVersion':
                        tokenValue = `${intrinsicParams.fileVersion}`;
                        break;
                    case 'lastModifiedDate':
                        tokenValue = intrinsicParams.lastModifiedDate;
                        break;
                    default:
                        tokenValue = token;
                        break;
                }
            }

            tokenValue = tokenValue.replace(/\n/g, `\n${selectedHeaderTemplate.headerPrefix}`);

            headerLine.push(tokenValue);
        });

        headerLines.push(headerLine.join(' '));
    });

    let rowIndex: number | undefined = workspace.getConfiguration(TOPPER).get(INSERT_AT_ROW);
    if (!rowIndex || rowIndex < -1) {
        rowIndex = 0;
    }

    let colIndex: number | undefined = workspace.getConfiguration(TOPPER).get(INSERT_AT_COL);
    if (!colIndex || colIndex < -1) {
        colIndex = 0;
    }

    return new BlueBird((resolve: (indices: { r: number; c: number }) => void, _2) => {
        if (rowIndex != undefined && colIndex != undefined) {
            console.debug(`rowIndex = ${rowIndex} and colIndex = ${colIndex}`);
            resolve({ r: rowIndex, c: colIndex });
        } else {
            BlueBird.reject(new Error('rowIndex and colIndex were not numbers!'));
        }
    });
}

/**
 * Has the editor publish the header string.
 * @param editor the reference to the active text editor of vscode
 * @param rowIndex the row index where the cursor is placed
 * @param colIndex the column index where the cursor is placed
 * @param headerString the header string that is published at the cursor location.
 * @returns Bluebird void marker promise that signifies success or failure!
 */
function publishHeaderString(editor: TextEditor, rowIndex: number, colIndex: number, headerString: string): BlueBird<void> {
    editor.edit(editBuilder => {
        editBuilder.insert(new Position(rowIndex, colIndex), `${headerString}\n\n`);
    });
    return new BlueBird((_1, _2) => null);
}
