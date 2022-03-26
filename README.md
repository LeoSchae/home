## ESBuild Plugin

The Eleventy app makes use of an ESBuild plugin for typescript.
ESBuild makes use of the "tsconfig.json" from the home directory.
The following extensions are handled:

- ".11ty.ts": Is handled similar to the ".11ty.js" files in the default 11ty setup.
- ".ts": This file will be bundled to a ".js" file.

### tsx

One can use tsx in templates.
To define the tsx factory one can use the comments
`js /** @jsx jsxFactory */` and `js /** @jsxFarag fragmentClassOrType */`.

### .const.ts(x) imports

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

A plugin is used to allow ".css" to be imported as css modules to any ".ts(x)" files.
The results are minified using postcss. The resulting import has the format:

```js
{
  css: string, // The full stylesheet as string
  classes: {
    [key: string]: string,
  }
}
```

Here the classes field contains the different css classnames and the corresponding transformed name.
(See css modules.)
