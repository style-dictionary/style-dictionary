/* @web/test-runner snapshot v1 */
export const snapshots = {};

snapshots["integration valid custom file headers file options registered file header should match snapshot"] = 
`/**
 * hello
 * Do not edit directly, this file was auto-generated.
 */

:root {
  --color-red: #ff0000;
}
`;
/* end snapshot integration valid custom file headers file options registered file header should match snapshot */

snapshots["integration valid custom file headers file options config file header should match snapshot"] = 
`/**
 * Do not edit directly, this file was auto-generated.
 * hello, world!
 */

:root {
  --color-red: #ff0000;
}
`;
/* end snapshot integration valid custom file headers file options config file header should match snapshot */

snapshots["integration valid custom file headers file options inline file header should match snapshot"] = 
`/**
 * build version 1.0.0
 */

:root {
  --color-red: #ff0000;
}
`;
/* end snapshot integration valid custom file headers file options inline file header should match snapshot */

snapshots["integration valid custom file headers platform options no file options should match snapshot"] = 
`/**
 * Do not edit directly, this file was auto-generated.
 * hello, world!
 */

module.exports = {
  color: {
    red: {
      key: "{color.red}",
      value: "#ff0000",
      original: {
        value: "#ff0000",
        key: "{color.red}",
      },
      name: "ColorRed",
      attributes: {
        category: "color",
        type: "red",
      },
      path: ["color", "red"],
    },
  },
};
`;
/* end snapshot integration valid custom file headers platform options no file options should match snapshot */

snapshots["integration valid custom file headers platform options showFileHeader should match snapshot"] = 
`module.exports = {
  color: {
    red: {
      key: "{color.red}",
      value: "#ff0000",
      original: {
        value: "#ff0000",
        key: "{color.red}",
      },
      name: "ColorRed",
      attributes: {
        category: "color",
        type: "red",
      },
      path: ["color", "red"],
    },
  },
};
`;
/* end snapshot integration valid custom file headers platform options showFileHeader should match snapshot */

snapshots["integration valid custom file headers platform options file header override should match snapshot"] = 
`/**
 * Header overridden
 */

module.exports = {
  color: {
    red: {
      key: "{color.red}",
      value: "#ff0000",
      original: {
        value: "#ff0000",
        key: "{color.red}",
      },
      name: "ColorRed",
      attributes: {
        category: "color",
        type: "red",
      },
      path: ["color", "red"],
    },
  },
};
`;
/* end snapshot integration valid custom file headers platform options file header override should match snapshot */

snapshots["integration formatting.fileHeader API should allow overriding commentStyle via formatting.fileHeader at file level"] = 
`
// Do not edit directly, this file was auto-generated.

$color-red: #ff0000;
`;
/* end snapshot integration formatting.fileHeader API should allow overriding commentStyle via formatting.fileHeader at file level */

snapshots["integration formatting.fileHeader API should allow overriding commentStyle via formatting.fileHeader at platform level"] = 
`
// Do not edit directly, this file was auto-generated.

$color-red: #ff0000;
`;
/* end snapshot integration formatting.fileHeader API should allow overriding commentStyle via formatting.fileHeader at platform level */

snapshots["integration formatting.fileHeader API should allow custom header/footer via formatting.fileHeader for legal comments"] = 
`/*!
 * Do not edit directly, this file was auto-generated.
 */

:root {
  --color-red: #ff0000;
}
`;
/* end snapshot integration formatting.fileHeader API should allow custom header/footer via formatting.fileHeader for legal comments */

snapshots["integration formatting.fileHeader API file-level formatting.fileHeader should override platform-level"] = 
`
// Do not edit directly, this file was auto-generated.

$color-red: #ff0000;
`;
/* end snapshot integration formatting.fileHeader API file-level formatting.fileHeader should override platform-level */

