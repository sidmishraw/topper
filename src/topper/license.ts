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
 * license.ts
 * @author Sidharth Mishra
 * @created 2019-06-13T21:35:08.303Z-07:00
 * @last-modified 2019-06-13T22:37:48.571Z-07:00
 */

import * as Moment from 'moment';
import { render } from 'mustache';
import { readFileSync } from 'fs';
import 'path';
import { resolve } from 'path';

/**
 * A license template.
 */
export class LicenseTemplate {
    /** the copyright year. */
    private _year: string;
    public get year(): string {
        return this._year;
    }
    public set year(value: string) {
        this._year = value;
    }

    /** the author name to be used in the copyright of the license. */
    private _author: string;
    public get author(): string {
        return this._author;
    }
    public set author(value: string) {
        this._author = value;
    }

    /**
     * Creates a license template.
     * @param year the current year, copyright year
     * @param author the author name - full to be displayed in the copyright
     */
    constructor(year: string, author: string) {
        this._year = year;
        this._author = author;
    }

    /**
     * Renders the license text substituting the year and author values.
     * @param licenseTemplateText the template string for the license
     * @returns the final license text
     */
    render(licenseTemplateText: string): string {
        return render(licenseTemplateText, { year: this._year, author: this._author });
    }
}

/**
 * The various types of licenses supported.
 */
export enum LicenseType {
    MIT,
    APACHE_2_0,
    BSD_3_CLAUSE_LICENSE,
    GNU,
}

/**
 * Given the string, returns the license type enum. Defaults to MIT.
 * @param txt the textual representation of the license type
 * @returns the license type enum, defaults to MIT.
 */
export function getAsLicenseType(txt: string): LicenseType {
    if (txt.toLowerCase() === 'mit') return LicenseType.MIT;
    if (txt.toLowerCase() === 'apache_2_0' || txt.toLowerCase() === 'apache2.0') return LicenseType.APACHE_2_0;
    if (txt.toLowerCase() === 'bsd_3_clause_license' || txt.toLowerCase() === 'bsd3') return LicenseType.BSD_3_CLAUSE_LICENSE;
    if (txt.toLowerCase() === 'gnu') return LicenseType.GNU;
    return LicenseType.MIT; // default
}

/**
 * Creates the license text using the author name.
 * @param author the name of the author
 * @returns the license text
 */
export function createLicenseText(author: string, licenseType: LicenseType): string {
    let year = Moment().format('YYYY');
    let licenseTemplate = new LicenseTemplate(year, author);
    switch (licenseType) {
        case LicenseType.BSD_3_CLAUSE_LICENSE:
            return getBsd3ClauseLicenseText(licenseTemplate);
        case LicenseType.GNU:
            return getGnuLicenseText(licenseTemplate);
        case LicenseType.APACHE_2_0:
            return getApache2LicenseText(licenseTemplate);
        case LicenseType.MIT:
        default:
            return getMitLicenseText(licenseTemplate);
    }
}

/// BSD 3 Clause license text generation
///
function getBsd3ClauseLicenseText(licenseTemplate: LicenseTemplate): string {
    try {
        let licenseText = readFileSync(resolve(__dirname, '../resources/bsd-3.0.txt'), 'utf8');
        return licenseTemplate.render(licenseText);
    } catch (e) {
        console.error('Error: ', e.stack);
    }
    return `COULDN'T LOAD BSD 3 CLAUSE LICENSE`;
}

/// GNU license text generation
///
function getGnuLicenseText(licenseTemplate: LicenseTemplate): string {
    try {
        let licenseText = readFileSync(resolve(__dirname, '../resources/gnu.txt'), 'utf8');
        return licenseTemplate.render(licenseText);
    } catch (e) {
        console.error('Error: ', e.stack);
    }
    return `COULDN'T LOAD GNU LICENSE`;
}

/// Apache 2.0 license text generation
///
function getApache2LicenseText(licenseTemplate: LicenseTemplate): string {
    try {
        let licenseText = readFileSync(resolve(__dirname, '../resources/apache-2.0.txt'), 'utf8');
        return licenseTemplate.render(licenseText);
    } catch (e) {
        console.error('Error: ', e.stack);
    }
    return `COULDN'T LOAD APACHE 2.0 LICENSE`;
}

/// MIT license text generation
///
function getMitLicenseText(licenseTemplate: LicenseTemplate): string {
    try {
        let licenseText = readFileSync(resolve(__dirname, '../resources/mit.txt'), 'utf8');
        return licenseTemplate.render(licenseText);
    } catch (e) {
        console.error('Error: ', e.stack);
    }
    return `COULDN'T LOAD MIT LICENSE`;
}
