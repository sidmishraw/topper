# Topper

Author: Sidharth Mishra

## Change Log

All notable changes to the "topper" extension will be documented in this file.

### [v0.3.0]

* Fixed issue where the `@last-modified` field in the header was not getting updated automatically. Now, there is a configuration field `topper.lastModified` where the users can specify their custom field names for `last-modified` incase they do not use `@last-modified`. The default value is `@last-modified`.

> Caveats: The implementation is choppy in some aspects because of limited support from VS Code APIs. Expect a better implementation in the next version.

* Code cleanup.

### [v0.2.0]

* Code cleanup.

* Addition of profile specific shortcuts added to `keybinding.json` of VSCode:

```json
  {
    "key": "cmd+shift+t 1",
    "command": "topper.addTopHeader.personalProfile"
  },
  {
    "key": "shift+cmd+t 2",
    "command": "topper.addTopHeader.officeProfile"
  }
```

The first key combination is `Command + Shift + T` followed by a `1` or `2` depending on the profile. The user is free to bind any profile to any key combination.
The commandId is of the form `topper.addTopHeader.<your-profile-name>`.

### [v0.1.0]

* Stable release.

### [v0.0.3]

* Changed the extension's command from `extension.addTopHeader` to `topper.addTopHeader`. To make it easier for customized keybinding.

* Code cleanup.

### [v0.0.2]

* Added support for multi line strings as values for the custom template parameters.

* Updated `lastModifiedDate` to be fetched from the underlying OS. This is the true last modified date.

### [v0.0.1]

* Initial release of `Topper` extension. [Alpha]
