# Topper README

`Topper` is a file header utility. It will add a header to the file depending on the configurations made by you.

## Features

The gif below shows how to use the `Topper` extension.

![](https://zippy.gfycat.com/LeanNeatEasternnewt.gif)

## Extension Settings

This extension contributes the following settings:

* `topper.customTemplateParameters`: This configures template parameters. These parameters can be used in the header templates as placeholders.

  The default setting is:

  ```javascript
  [
    {
      personalProfile: {
        author: "bulbasaur",
        website: "bulbasaur.github.bitbucket.yababbdadado.com",
        copyright: "None",
        license: "None",
        email: "ivysaur.bulbasaur@venosaur.com"
      }
    },
    {
      officeProfile: {
        author: "John Doe",
        department: "Product Development",
        email: "john.doe@doejohn.com"
      }
    }
  ];
  ```

  You can add any number of profiles to the list. You also have the ability to add in any number of parameters here in your profiles. This way you can use those parameters in the header templates.

* `topper.headerTemplates`: This is the list of all the header templates you configure depending upon the languages being used.

  The list of language Ids can be found here: [https://code.visualstudio.com/docs/languages/identifiers](https://code.visualstudio.com/docs/languages/identifiers).

  If the file's `languageId` is not configured here, it defaults to the `defaultCStyled` header template.

  > Note: Please do not delete the `defaultCStyled` template. Copy it over when configuring this section.

  > Note: Please keep the `defaultCStyled` as the first element in the list of all the header templates.

  The default configuration for the header templates is:

  ```javascript
  [
    {
      defaultCStyled: {
        headerBegin: "/**",
        headerPrefix: "*",
        headerEnd: "*/",
        template: [
          "${headerBegin}",
          "${headerPrefix} ${fileName}",
          "${headerPrefix} @author ${author}",
          "${headerPrefix} @description ${description}",
          "${headerPrefix} @created ${createdDate}",
          "${headerPrefix} @last-modified ${lastModifiedDate}",
          "${headerEnd}"
        ]
      }
    },
    {
      python: {
        headerBegin: "#",
        headerPrefix: "#",
        headerEnd: "#",
        template: [
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
  ];
  ```

  As you can already see, each header template object is of form:

  ```
    {
        "<languageId>": {
            "headerBegin": <string value>,
            "headerPrefix": <string value>,
            "headerEnd": <string value>,
            "template": [
                <string values with parameters>
            ]
        }
    }
  ```

  To use the parameters inside the `template`, use the `${<parameter name>}` notation.

Topper has a few intrinsic template parameters:

* `createdDate` - The date when the file was created, this is obtained from the underlying OS. If the file is `Untitled-x` or unsaved, the created time defaults to the time `Topper: Add Header` command was invoked.

- `lastModifiedDate` - The date when the file was modified, this too is obtained from the underlying OS. If the file is `Untitled-x` or unsaved, the created time defaults to the time `Topper: Add Header` command was invoked.

* `fileName` - The name of the file

- `fileVersion` - The VSCode maintained fileVersion

## Defining a custom keyboard shortcut

To define a custom keyboard shortcut do the following:

* Preferences -> Keyboard Shortcuts -> Open `keybindings.json`

* Add the following entry:

```json
{
  "key": "cmd+shift+t",
  "command": "topper.addTopHeader"
}
```

The `"key"` field can be any key combination. The command has to be `"topper.addTopHeader"`.

## Changelog

### [v0.0.3]

* Changed the extension's command from `extension.addTopHeader` to `topper.addTopHeader`. To make it easier for customized keybinding.

* Code cleanup.

### [v0.0.2]

* Added support for multi line strings as values for the custom template parameters.

* Updated `lastModifiedDate` to be fetched from the underlying OS. This is the true last modified date.

### [v0.0.1]

* Initial release of `Topper` extension. [Alpha]

## P.S

In case of any suggestions or issues please email me at [**sidharth.mishra@sjsu.edu**](mailto:sidharth.mishra@sjsu.edu)

## References:

* Template style configuration idea inspired by [https://github.com/doi/fileheadercomment](https://github.com/doi/fileheadercomment)
