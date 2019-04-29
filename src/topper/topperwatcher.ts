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
 * topperwatcher.ts
 * @author Sidharth Mishra
 * @created Sun Apr 14 2019 23:14:31 GMT-0700 (PDT)
 * @last-modified Sat Apr 27 2019 15:52:39 GMT-0700 (PDT)
 */

import { Range, workspace, Position, window } from 'vscode';
import {
    TOPPER,
    LAST_MODIFIED_DATE_KEY,
    DEFAULT_LAST_MODIFIED_KEY,
    LAST_MODIFIED_CAPTURE_REGEX,
    DEFAULT_LAST_MODIFIED_CAPURE_REGEX,
    DATE_FORMAT,
    DEFAULT_DATETIME_FORMAT,
} from './topper';
import * as Moment from 'moment';

/**
 * Starts the topper watcher that watches the files for updates. Once the file has been updated and if going to be saved, topper scans the modified file and updates the last-modified datetime if possible.
 * There is a possiblity vscode might ignore the `TextDocumentWillSaveEvent`, if so, then the watcher cannot do anything.
 */
export function startWatcher() {
    workspace.onWillSaveTextDocument(willSaveEvent => {
        try {
            const changedFileUri = willSaveEvent.document.uri;
            console.info(`Going to update the file at: ${changedFileUri.fsPath}`);
            updateLastModifiedDate(changedFileUri.fsPath);
        } catch (err) {
            console.log(`Error:: ${err}`);
        }
    });
}

/**
 * Updates the last-modified date section of the topper header.
 * @param filePath The file path
 */
function updateLastModifiedDate(filePath: string) {
    try {
        workspace.openTextDocument(filePath).then(modifiedTextDocument => {
            try {
                let lines = modifiedTextDocument.getText().split(/\n/);
                let lastModifiedKey: string | undefined = workspace.getConfiguration(TOPPER).get(LAST_MODIFIED_DATE_KEY);
                if (!lastModifiedKey) {
                    lastModifiedKey = DEFAULT_LAST_MODIFIED_KEY;
                }

                let lastModifiedRegexPattern: string | undefined = workspace.getConfiguration(TOPPER).get(LAST_MODIFIED_CAPTURE_REGEX);

                let lastModifiedRegex: RegExp;
                if (lastModifiedRegexPattern) {
                    lastModifiedRegex = new RegExp(lastModifiedRegexPattern);
                } else {
                    lastModifiedRegex = DEFAULT_LAST_MODIFIED_CAPURE_REGEX;
                }

                let lastModifiedDateLine = lines.filter(line => line.match(lastModifiedRegex)).find((_, index) => index == 0);
                if (!lastModifiedDateLine) {
                    console.info('no topper header present with last-updated field');
                    return;
                }

                // line number of the matched last modified date in the text document.
                //
                let modifiedDateLineIndex = lines.indexOf(lastModifiedDateLine);

                let matchedDateTime = lastModifiedDateLine.match(lastModifiedRegex);
                let matchedDateTimeText: string;
                if (matchedDateTime) {
                    matchedDateTimeText = matchedDateTime[1];
                } else {
                    console.info("couldn't extract the date time part, bailing out!");
                    return;
                }

                // get the starting index of the date-time text that needs to be replaced.
                let startIndex = lastModifiedDateLine.indexOf(matchedDateTimeText);

                // end index of the date-time text that needs to be replaced.
                let endIndex = startIndex + matchedDateTimeText.length;

                let replaceRange = new Range(new Position(modifiedDateLineIndex, startIndex), new Position(modifiedDateLineIndex, endIndex));

                const editor = window.activeTextEditor;
                if (!editor) {
                    console.info("couldn't get the reference to the active text editor, bailing out!");
                    return;
                }
                if (editor && editor.document !== modifiedTextDocument) {
                    console.info('the active file is not the modified file!');
                    return;
                }

                // Have the editor replace the old datetime with the current datetime.
                //
                editor.edit(edit => {
                    try {
                        let dateFormat: string | undefined = workspace.getConfiguration(TOPPER).get(DATE_FORMAT);
                        if (!dateFormat) {
                            dateFormat = DEFAULT_DATETIME_FORMAT;
                        }
                        edit.replace(replaceRange, Moment().format(dateFormat));
                    } catch (err) {
                        console.error(`Failed to replace the old last modified date with new one! ${err}`);
                    }
                });
            } catch (err) {
                console.error(`Failed to extract and update the last modified date-time in the header.. ${err}`);
            }
        });
    } catch (err) {
        console.error(`Error while updating last modified date :: ${err}`);
    }
}
