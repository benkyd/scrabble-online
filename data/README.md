

### language files

Language files start on the line after 4 hyphens, everything prior is metadata about the language. Some will be parsed by the locale parser

Locales are defined by their locale code, the translations are seperated by a colon (:) after the locale code.

Sometimes context clues may be neccesary for an accurate translation, everything after a semicolon won't be interpreted by the parser, therefore context clues can be given. These will be defined in the english (en) file

```Code:Translation/Text;Context```

Capitalisation is also important, if the english words are capitalised, the translations need to be capitalised in the same (if it makes sense) place


#### development

For development look for the scripts folder, there are scripts to translate the lang files to the locale file and vice verse
