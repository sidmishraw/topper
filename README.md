# Topper README

`Topper` is a file header utility. It will add a header to the file depending on the configurations made by you.


## Features

The gif below shows how to use the `Topper` extension.

<div style='position:relative;padding-bottom:65%'>
  <p>Command:: Topper: Add header</p>
  </br>
  </br>
  <iframe src='https://gfycat.com/ifr/LeanNeatEasternnewt' frameborder='0' scrolling='no' width='80%' height='80%' style='position:absolute;top:0;left:0;' allowfullscreen>
  </iframe>
</div>


## Extension Settings

This extension contributes the following settings:

* `topper.customTemplateParameters`: This configures template parameters. These parameters can be used in the header templates as placeholders.
  
  The default setting is:
  ```javascript
  [
    {
      "personalProfile": {
          "author": "bulbasaur",
          "website": "bulbasaur.github.bitbucket.yababbdadado.com",
          "copyright": "None",
          "license": "None",
          "email": "ivysaur.bulbasaur@venosaur.com"
      }
    },
    {
      "officeProfile": {
          "author": "John Doe",
          "department": "Product Development",
          "email": "john.doe@doejohn.com"
      }
    }
  ]
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
          "defaultCStyled": {
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
      },
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


Topper has a few intrinsic template parameters:
* `createdDate` - The date when the `Topper: Add header` command is invoked.
* `lastModifiedDate` - The date when the `Topper: Add header` command is invoked. [This is a WIP, I'm trying to make it auto updatable with every save.]
* `fileName` - The name of the file
* `fileVersion` - The VSCode maintained fileVersion


### 0.0.1

Initial release of `Topper` extension. [Alpha]

### P.S
In case of any suggestions or issues please email me at [**sidharth.mishra@sjsu.edu**](mailto:sidharth.mishra@sjsu.edu)

### References:
* Template style configuration idea inspired by [https://github.com/doi/fileheadercomment](https://github.com/doi/fileheadercomment)