## ESBuild Plugin

The Eleventy app makes use of an ESBuild plugin for typescript.
ESBuild makes use of the "tsconfig.json" from the home directory.
The following extensions are handled:

- ".11ty.ts": Is handled similar to the ".11ty.js" files in the default 11ty setup.
- ".ts": This file will be bundled to a ".js" file.

### .const.ts imports

A plugin is used to allow special ".const.ts" processing.
Files with the extension imported as preprocessed constants.
This can be used for preprocessing of values. For example:

```js
function foo() {
  return 5;
}
function bar() {
  return "bar";
}
export const foobar = foo() + bar();
```

will in reality import the values

```json
{
  "foobar": "5bar"
}
```

as a JSON file.

### .css imports

A plugin is used to allow ".css" to be imported to normal ".ts" files.
The results are minified using postcss.
