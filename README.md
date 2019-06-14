# Topper

```
Version: 1.2.0
```

`Topper` is a file header utility. It will add a header to the file depending on the configurations made by you.

## Features

Make yourself a language and profile specific beautiful or helpful file header. Have fun!

## Extension Settings

This extension contributes the following settings:

### `topper.customTemplateParameters`: This configures template parameters. These parameters can be used in the header templates as placeholders.

The default setting is:

```json
[
    {
        "personalProfile": {
            "author": "bulbasaur",
            "website": "bulbasaur.github.bitbucket.yababbdadado.com",
            "copyright": "None",
            "license": "None",
            "email": "ivysaur.bulbasaur@venosaur.com",
        },
    },
    {
        "officeProfile": {
            "author": "John Doe",
            "department": "Product Development",
            "email": "john.doe@doejohn.com",
        },
    },
];
```

You can add any number of profiles to the list. You also have the ability to add in any number of parameters here in your profiles. This way you can use those parameters in the header templates.

### `topper.defaultHeaderTemplate`: This configuration allows you to set a default header template across all the langauges in case you haven't defined a custom language specific header template. The language ID used for this header template is `default` and it should not be tinkered with. By default its value is:

```json
{
    "default": {
        "headerBegin": "/**",
        "headerPrefix": "*",
        "headerEnd": "*/",
        "template": [
            "${headerBegin}",
            "${headerPrefix} ${fileName}",
            "${headerPrefix} @author ${author}",
            "${headerPrefix} @description ${description}",
            "${headerPrefix} @created ${createdDate}",
            "${headerPrefix} @copyright ${copyright}",
            "${headerPrefix} @last-modified ${lastModifiedDate}",
            "${headerEnd}"
        ]
    }
}
```

### `topper.headerTemplates`: This is the list of all the header templates you configure depending upon the languages being used.

The list of language Ids can be found here: [https://code.visualstudio.com/docs/languages/identifiers](https://code.visualstudio.com/docs/languages/identifiers).

In case the language name or ID is not found: the following header template is used:

```json
{
    "headerBegin": "/**",
    "headerPrefix": "*",
    "headerEnd": "*/",
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
```

Additionally, the default configuration for the header templates is:

```json
[
    {
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
]
```

As you can already see, each header template object is of form:

```javascript
  {
      "[languageId]": {
          "headerBegin": string,
          "headerPrefix": string,
          "headerEnd": string,
          "template": string[] // <string values with parameters>
      }
  }
```

To use the parameters inside the `template`, use the `${<parameter name>}` notation.

### [CAUTION] `topper.lastModified`: The key of the last-modified field in the header template --- `@last-modified`. Topper looks for this to determine if it needs to update the last-modified date-time value in your header. It defaults to `@last-modified`. For example, if you assign the value to `Modified`, then your header field for `Modified` should have be defined as `${headerPrefix} Modified ${lastModifiedDate}` for it to be considered by topper for automatic updation.

### [CAUTION] `topper.lastModifiedRegex`: The regular expression used for capturing the last modified date in the header and auto-update it when the file is saved.

Defaults to:

```javascript
'[ ]*\\@last\\-modified\\s*.?\\s+((\\d{4}-\\d{2}-\\d{2})T(\\d{2}:\\d{2}:\\d{2}\\.\\d{3})Z([\\+\\-]?\\d{2}:\\d{2}))\\n*';
```

> Note: This configuration is dependent on the `topper.lastModified` and `topper.dateFormat` values, please make sure that both are in sync, otherwise Topper will not be able to capture the last modified field in the header and update the timestamp.

### [CAUTION] `topper.dateFormat`: The format to be used for created date and last modified date values in the header. Topper uses Moment.js so please refer to the date formatting rules mentioned in moment.js. https://momentjs.com/docs/ . The default is ISO date format.

Defaults to:

```javascript
'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]Z';
```

> Note: Please make sure that the last date modified regex is also in sync to the changes made to date format, otherwise Topper will not be able to automatically update the last modified timestamp in the header.

### [CAUTION] `topper.insertAtRow`: The row from where to insert the header string at! Defaults to `0`.

> Note: Please override this only if required, the default value is a SANE value. thanks :)

### [CAUTION] `topper.insertAtCol`: The column from where to insert the header string at! Defaults to 0.

> Note: Please override this only if required, the default value is a SANE value. thanks :)

## Topper's intrinsic parameters

Topper has the following intrinsic template parameters. The values of these parameters are extracted from the underlying OS and the file metadata:

-   `createdDate` - The date when the file was created, this is obtained from the underlying OS. If the file is `Untitled-x` or unsaved, the created time defaults to the time `Topper: Add Header` command was invoked.

-   `lastModifiedDate` - The date when the file was modified, this too is obtained from the underlying OS. If the file is `Untitled-x` or unsaved, the created time defaults to the time `Topper: Add Header` command was invoked.

-   `fileName` - The name of the file.

-   `fileVersion` - The VSCode maintained file version.

## Defining a custom keyboard shortcut

To define a custom keyboard shortcut do the following:

-   Preferences -> Keyboard Shortcuts -> Open `keybindings.json`

-   Add the following entry:

```json
// This opens up the interactive Topper with all the popups.
{
    "key": "cmd+shift+t",
    "command": "topper.addTopHeader"
}
```

or

```json
// Defines the shortcut for the specific profile. Now only that specific profile is invoked. No annoying popups!
{
    "key": "<your-key-combination>",
    "command": "topper.addTopHeader.<your-profile-name>"
}
```

For eg:

```json
// Invokes Topper using the `personalProfile` directly, skipping all the interactive popups/dialog boxes.
{
    "key": "cmd+shift+t 1",
    "command": "topper.addTopHeader.personalProfile"
}
```

The `"key"` field can be any key combination. The command has to be `"topper.addTopHeader"`.

## Adding license text to header

Currently 4 license types are supported:

-   Apache 2.0 -> code = APACHE_2_0
-   MIT -> code = MIT
-   BSD 3 Clause -> code = BSD_3_CLAUSE_LICENSE
-   GNU -> code = GNU

-   Default license type is MIT.
-   To add a license to the header, define a `license` field in your profile specific parameters and use the respective code of the license. If an invalid code is used, MIT is used by default.
-   The license text uses the name defined in the profile's `author` field as the author name. If `author` field is not defined, then, `Author's Full Name` is printed as is.

For example:

```json
[
    {
        "personalProfile": {
            "author": "bulbasaur",
            "website": "bulbasaur.github.bitbucket.yababbdadado.com",
            "copyright": "None",
            "license": "MIT",
            "email": "ivysaur.bulbasaur@venosaur.com",
        },
    },
    {
        "officeProfile": {
            "author": "John Doe",
            "department": "Product Development",
            "email": "john.doe@doejohn.com",
            "license": "GNU"
        },
    },
];
```

## Changelog

The change log is available at: [change-log](./CHANGELOG.md)

In case of any suggestions or issues please feel free to create an issue on the Github repo.

## References

-   Template style configuration idea inspired by [https://github.com/doi/fileheadercomment](https://github.com/doi/fileheadercomment)
