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
 * topper.ts
 * @author Sidharth Mishra
 * @created Sun Apr 14 2019 22:48:09 GMT-0700 (PDT)
 * @last-modified Sat Apr 27 2019 22:41:58 GMT-0700 (PDT)
 */

/** the name of the extension. */
export const TOPPER = 'topper';

/** the base of the topper's add top header command. It is followed by the profile name to have the desired effect. */
export const TOPPER_ADD_TOP_HEADER_CMD_BASE = 'topper.addTopHeader';

/**
 * Generates the complete add top header command for the particular profile.
 * @param profileName the profile name
 * @returns the command string.
 */
export function makeAddTopHeaderCmd(profileName: string): string {
    return `${TOPPER_ADD_TOP_HEADER_CMD_BASE}.${profileName}`;
}

/**
 * Generates the default add top header command which is exposed to the user through the command palette.
 * @returns the command string.
 */
export function defaultAddTopHeaderCmd(): string {
    return `${TOPPER_ADD_TOP_HEADER_CMD_BASE}`;
}

/** the key for custom template parameters defined in the topper config. */
export const CUSTOM_TEMPLATE_PARAMETERS = 'customTemplateParameters';

/** the key for header templates defined in the topper config. */
export const HEADER_TEMPLATES = 'headerTemplates';

/** the key for the default header template used for all the languages if no custom template is defined. */
export const DEFAULT_HEADER_TEMPLATE = 'defaultHeaderTemplate';

/** the default language ID to be used for the default header template. */
export const DEFAULT_LANGUAGE_ID = 'default';

// list of intrinsic parameter names that topper provides
//
/** the file name. It is a key whose value is defined by topper. */
export const FILE_NAME = 'fileName';

/** the created date in the ISO format. It is a key whose value is defined by topper.  */
export const CREATED_DATE = 'createdDate';

/** the last modified date in the ISO format. It is a key whose value is defined by topper. */
export const LAST_MODIFIED_DATE = 'lastModifiedDate';

/** the key used in the header for the last modified date field in topper config. Defaults to `@last-modified`*/
export const LAST_MODIFIED_DATE_KEY = 'lastModified';

/** the default value if none specifically specified for the last modified date field in the header. */
export const DEFAULT_LAST_MODIFIED_KEY = '@last-modified';

/** the regex used for capturing the last modified date value in the header for updation. */
export const LAST_MODIFIED_CAPTURE_REGEX = 'lastModifiedRegex';

/** the default regex used for capturing the last modified date key and value for updation. */
export const DEFAULT_LAST_MODIFIED_CAPURE_REGEX = new RegExp(
    '[ ]*\\@last\\-modified\\s*.?\\s+((\\d{4}-\\d{2}-\\d{2})T(\\d{2}:\\d{2}:\\d{2}\\.\\d{3})Z([\\+\\-]?\\d{2}:\\d{2}))\\n*'
);

/** the key for custom date formatting in topper config. */
export const DATE_FORMAT = 'dateFormat';

/** follows the ISO date format just like MongoDB: '2019-04-27T14:56:50.664Z-07:00' */
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]Z';

/** insert at row key in topper config. */
export const INSERT_AT_ROW = 'insertAtRow';

/** insert at col in topper config. */
export const INSERT_AT_COL = 'insertAtCol';

/**
 * A custom profile specific template represents an object –– a simple JSON with the parameters and their values defined by the user.
 * For example:
 * ```
 * {
 *      "author": "Sidharth Mishra",
 *      "website": "https://sidmishraw.github.io",
 *      "copyright": "Sidharth Mishra (c) 2019",
 *      "email": "abc@yahooo.com"
 * }
 * ```
 */
export interface ProfileTemplate {
    [templateParameter: string]: string;
}

/**
 * Represents a custom template parameter obtained from the user as part of configuration of Topper. They map a profile name to its corresponding profile specific template.
 * For example:
 * ```
 * {
 *      "personal": {
 *          "author": "Sidharth Mishra",
 *          "website": "https://sidmishraw.github.io",
 *          "copyright": "Sidharth Mishra (c) 2019",
 *          "email": "abc@yahooo.com"
 *       }
 * }
 * ```
 */
export interface CustomTemplateParameter {
    [profileName: string]: ProfileTemplate;
}

/**
 * Extracts the profile name from a custom template parameter.
 * @param customTemplateParameter the custom template parameter
 * @returns the profile name.
 */
export function getProfileName(customTemplateParameter: CustomTemplateParameter): string {
    return Object.getOwnPropertyNames(customTemplateParameter)[0];
}

/**
 * Represents a header template. For example: for the python language, we could define a header template as,
 * ```
 * {
        "python": {
            "headerBegin": "#",
            "headerPrefix": "#",
            "headerEnd": "#",
            "template": [
                "${headerBegin}",
                "${headerPrefix} ${fileName}",
                "${headerPrefix} @author ${author}",
                "${headerPrefix} @description ${description}",
                "${headerPrefix} @created ${createdDate}",
                "${headerPrefix} @last-modified ${lastModifiedDate}",
                "${headerEnd}"
            ]
        }
    }
 * ```
 * The variables are defined as `${<variable-name>}`. Some of the variables are extracted from the profile specific definition: `author`, etc. 
 * Others are pre-defined: `createdDate`, `lastModifiedDate`, etc.
 */
export interface HeaderTemplate {
    [languageId: string]: LanguageHeaderTemplate;
}

/**
 * The metadata of a text-document handled by vscode.
 */
export interface TextDocumentMetadata {
    filePath: string;
    fileName: string;
    fileVersion: string | number;
    languageId: string;
}

/**
 * Represents a language specific header template.
 */
export class LanguageHeaderTemplate {
    /** the begining line of the header. */
    private _headerBegin: string;
    /** the prefix used on each line of the header. */
    private _headerPrefix: string;
    /** the end line of the header. */
    private _headerEnd: string;
    /** the template that describes the structure of the header. */
    private _template: string[];

    public constructor(headerBegin: string, headerPrefix: string, headerEnd: string, template: string[]) {
        this._headerBegin = headerBegin;
        this._headerPrefix = headerPrefix;
        this._headerEnd = headerEnd;
        this._template = template;
    }

    public get headerBegin() {
        return this._headerBegin;
    }
    public set headerBegin(headerBegin: string) {
        this._headerBegin = headerBegin;
    }

    public get headerPrefix() {
        return this._headerPrefix;
    }
    public set headerPrefix(headerPrefix: string) {
        this._headerPrefix = headerPrefix;
    }

    public get headerEnd(): string {
        return this._headerEnd;
    }
    public set headerEnd(headerEnd: string) {
        this._headerEnd = headerEnd;
    }

    public get template(): string[] {
        return this._template;
    }
    public set template(template: string[]) {
        this._template = template;
    }
}

/**
 * The parameters that are provided by topper.
 */
export class TopperProvidedParam {
    private _createdDate: string;
    private _lastModifiedDate: string;
    private readonly _fileName: string;
    private readonly _fileVersion: string | number;

    constructor(createdDate: string | null, lastModifiedDate: string | null, fileName: string, fileVersion: string | number) {
        if (createdDate) this._createdDate = createdDate;
        else this._createdDate = '';

        if (lastModifiedDate) this._lastModifiedDate = lastModifiedDate;
        else this._lastModifiedDate = '';

        this._fileName = fileName;
        this._fileVersion = fileVersion;
    }

    get createdDate(): string {
        return this._createdDate;
    }

    set createdDate(s: string) {
        this._createdDate = s;
    }

    get lastModifiedDate(): string {
        return this._lastModifiedDate;
    }

    set lastModifiedDate(s: string) {
        this._lastModifiedDate = s;
    }

    get fileName(): string {
        return this._fileName;
    }

    get fileVersion(): string | number {
        return this._fileVersion;
    }
}
