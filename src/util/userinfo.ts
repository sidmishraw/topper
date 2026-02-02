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
 * userinfo.ts
 * @author Sidharth Mishra
 * @description Utility module for detecting the current user through various methods
 * @created 2026-02-01
 * @last-modified 2026-02-01
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * Represents user information with name and optional email.
 */
export interface UserInfo {
    name: string;
    email?: string;
}

/**
 * Default unknown user fallback values.
 */
const DEFAULT_USER: UserInfo = {
    name: 'Unknown',
    email: 'unknown-user@example.com'
};

/**
 * Attempts to get user info from Git configuration.
 * @param workingDir Optional working directory for git commands (for local repo config)
 * @returns Promise resolving to UserInfo or null if git config not available
 */
async function getGitUserInfo(workingDir?: string): Promise<UserInfo | null> {
    try {
        const execOptions: { cwd?: string; timeout: number } = { timeout: 5000 };
        if (workingDir) {
            execOptions.cwd = workingDir;
        }

        // Try to get git user.name
        const nameResult = await execAsync('git config user.name', execOptions);
        const name = nameResult.stdout.trim();

        if (!name) {
            return null;
        }

        // Try to get git user.email
        let email: string | undefined;
        try {
            const emailResult = await execAsync('git config user.email', execOptions);
            email = emailResult.stdout.trim() || undefined;
        } catch {
            // Email is optional, continue without it
        }

        return { name, email };
    } catch (error) {
        // Git not available or not in a git repository
        console.debug('Git user info not available:', error);
        return null;
    }
}

/**
 * Gets user info from the operating system.
 * @returns UserInfo from OS (username only, no email)
 */
function getOSUserInfo(): UserInfo | null {
    try {
        const userInfo = os.userInfo();

        if (userInfo.username) {
            return {
                name: userInfo.username
                // No email from OS - keep it simple
            };
        }

        return null;
    } catch (error) {
        console.debug('OS user info not available:', error);
        return null;
    }
}

/**
 * Gets the current user info using a tiered approach:
 * 1. Git config (user.name and user.email)
 * 2. OS user info (os.userInfo())
 * 3. Default fallback ("Unknown <unknown-user@example.com>")
 *
 * @param workingDir Optional working directory for git commands
 * @returns Promise resolving to UserInfo
 */
export async function getCurrentUserInfo(workingDir?: string): Promise<UserInfo> {
    // Tier 1: Try Git config
    const gitUser = await getGitUserInfo(workingDir);
    if (gitUser) {
        console.debug('Using Git user info:', gitUser);
        return gitUser;
    }

    // Tier 2: Try OS user info
    const osUser = getOSUserInfo();
    if (osUser) {
        console.debug('Using OS user info:', osUser);
        return osUser;
    }

    // Tier 3: Default fallback
    console.debug('Using default user info');
    return DEFAULT_USER;
}

/**
 * Formats user info as a string.
 * If email is available, returns "Name <email>", otherwise just "Name".
 *
 * @param userInfo The user info to format
 * @returns The formatted user string
 */
export function formatUserInfo(userInfo: UserInfo): string {
    if (userInfo.email) {
        return `${userInfo.name} <${userInfo.email}>`;
    }
    return userInfo.name;
}
