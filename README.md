# TSLint JSX Required Attributes Rule

> Custom rule for tslint

[![Build Status](https://dev.azure.com/paul2005/paul2005/_apis/build/status/PabloDiablo.tslint-jsx-required-attributes?branchName=master)](https://dev.azure.com/paul2005/paul2005/_build/latest?definitionId=1&branchName=master)

Require JSX elements to contain a specified attribute when they match either a specified element type or a specified attribute.

```shell
npm i -D tslint-jsx-required-attributes
```

_tslint.json_

```javascript
"rulesDirectory": [
    "node_modules/tslint-jsx-required-attributes"
],
"rules": {
    "jsx-required-attributes": {
      "severity": "warning",
      "options": [[
        "data-id", // name of required attribute
        {
          "tagNames": [ // require attributes on these element types
            "Link",
            "a",
            "button"
          ],
          "attributeNames": [ // require attribute on any element with these attributes
            "onClick"
          ]
        }
      ]]
    }
}
```

## Dependencies

This package requires two peer dependencies: `typescript` and `tslint`. It installs no additional dependencies.
