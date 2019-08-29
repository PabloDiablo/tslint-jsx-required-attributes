# TSLint JSX Required Attributes Rule

> Custom rule for tslint

Require JSX elements to contain a specified attribute when they match either a specified element type or a specified attribute.

```shell
npm i -D tslint-jsx-required-attributes
```

_tslint.json_

```json
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

This package requires two peer dependencies: `typescript` and `tslint`. It installs one dependency: `tsutils`.
