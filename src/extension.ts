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
 * extension.ts
 * @author Sidharth Mishra
 * @created Sun Apr 07 2019 19:33:36 GMT-0700 (PDT)
 * @last-modified Sun Apr 28 2019 23:50:19 GMT-0700 (PDT)
 */

import { ExtensionContext, workspace, commands } from 'vscode';
import { startWatcher } from './topper/topperwatcher';
import {
    CustomTemplateParameter,
    TOPPER,
    CUSTOM_TEMPLATE_PARAMETERS,
    getProfileName,
    makeAddTopHeaderCmd,
    defaultAddTopHeaderCmd,
} from './topper/topper';
import { addTopHeader } from './topper/service';

/**
 * Extension activation event handler.
 * @param context the extension context
 */
export function activate(context: ExtensionContext) {
    console.info('topper is active!');
    startWatcher();

    let customTemplateParameters: CustomTemplateParameter[] | undefined = workspace.getConfiguration(TOPPER).get(CUSTOM_TEMPLATE_PARAMETERS);
    if (!customTemplateParameters) {
        console.info("Couldn't load the custom template parameters!");
        return;
    }

    //
    // also register a default profile with the `topper.addTopHeader` command so that it can be exposed
    // to the end user through the command palette.
    //
    customTemplateParameters.forEach((customTemplateParameter, index) => {
        let profileName: string = getProfileName(customTemplateParameter);
        let addTopHeaderCmd: string = makeAddTopHeaderCmd(profileName);
        console.info(`Registering the command with vscode:  ${addTopHeaderCmd}`);
        context.subscriptions.push(commands.registerCommand(addTopHeaderCmd, () => addTopHeader(profileName)));

        // registers the first profile as the default profile to the default add top header command,
        // this commnad will be visible to the end user through their command palette.
        //
        if (index === 0) {
            context.subscriptions.push(commands.registerCommand(defaultAddTopHeaderCmd(), () => addTopHeader(profileName)));
        }
    });
}

/**
 * The extension deactivation context handler
 */
export function deactivate() {
    console.info('topper has deactivated! Bye!');
}
