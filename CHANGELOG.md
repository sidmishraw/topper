# Topper

Author: Sidharth Mishra

## Change Log

All notable changes to the "topper" extension will be documented in this file.

### [v1.2.0]

-   Added license text generation for header. Added 4 license types:
    -   Apache 2.0 -> code = APACHE_2_0
    -   MIT -> code = MIT
    -   BSD 3 Clause -> code = BSD_3_CLAUSE_LICENSE
    -   GNU -> code = GNU
-   Default license is MIT
-   To add a license to the header, define a `license` field in your profile specific and use the respective code of the license. If an invalid code is used, MIT is used by default.
-   The license text uses the name defined in the profile's `author` field as the author name. If `author` field is not defined, then, `Author's Full Name` is printed as is.

### [v1.1.0]

-   Added a new configuration parameter called `topper.defaultHeaderTemplate`. This parameter allows to customize the default header template across all the languages in case a custom language specific template is not defined yet. The language ID used for the default header template is `default` and it should not be tinkered with!!!

### [v1.0.0]

**[!!!] This release has breaking changes and might need some configuration from your part for the first time you start using it –– especially on older files that were annotated with older versions of Topper. No worries for new users and new files.**

-   Re-wrote the code from scratch in Typescript for better maintenance. Also got rid of the popup, it seems that the use of a keyboard shortcut is the best approach. The other way is to invoke command directly using the commands menu of vscode.
-   The command palette now shows a command that is bound to the first profile in the list, no need for the popup –– this was made for streamlined usage. For a more streamlined approach, please use the keyboard shortcuts to the desired profiles.
-   [CAUTION] Externalized the date formatting for created date and last modified date.
-   [CAUTION] Externalized the last modified date capture regex in case the user defines their custom last modified date format.
-   [CAUTION] Externalized the row and column indices to be used for insertion of the header string: use with care. Defaults to 0 for both row and col for sanity.

### [v0.4.0]

-   Merged pull request from @Drakesinger into master to allow more flexible formats for the `last modified` field in the headers. Thanks @Drakesinger for the PR!

-   Updated the readme document with more information about the `topper.lastModified` contribution point. Since, I had forgotten to add the description of this contribution point in the document I believe some of the users might have found it difficult to configure the `lastModified` field name in their headers. Sorry!

### [v0.3.2]

-   Fixed the issue [problem about last-modified when press cmd+s #3](https://github.com/sidmishraw/topper/issues/3). Now, topper's watcher listens to the `TextDocumentWillSaveEvent` and updates the last-modified field before the document saves.

### [v0.3.1]

-   Fixed the issue of Topper capturing templates of "last-modified". Now, there are strict patterns in place.

### [v0.3.0]

-   Fixed issue where the `@last-modified` field in the header was not getting updated automatically. Now, there is a configuration field `topper.lastModified` where the users can specify their custom field names for `last-modified` incase they do not use `@last-modified`. The default value is `@last-modified`.

> Caveats: The implementation is choppy in some aspects because of limited support from VS Code APIs. Expect a better implementation in the next version.

-   Code cleanup.

### [v0.2.0]

-   Code cleanup.

-   Addition of profile specific shortcuts added to `keybinding.json` of VSCode:

```json
({
    "key": "cmd+shift+t 1",
    "command": "topper.addTopHeader.personalProfile"
},
{
    "key": "shift+cmd+t 2",
    "command": "topper.addTopHeader.officeProfile"
})
```

The first key combination is `Command + Shift + T` followed by a `1` or `2` depending on the profile. The user is free to bind any profile to any key combination.
The commandId is of the form `topper.addTopHeader.<your-profile-name>`.

### [v0.1.0]

-   Stable release.

### [v0.0.3]

-   Changed the extension's command from `extension.addTopHeader` to `topper.addTopHeader`. To make it easier for customized keybinding.

-   Code cleanup.

### [v0.0.2]

-   Added support for multi line strings as values for the custom template parameters.

-   Updated `lastModifiedDate` to be fetched from the underlying OS. This is the true last modified date.

### [v0.0.1]

-   Initial release of `Topper` extension. [Alpha]
