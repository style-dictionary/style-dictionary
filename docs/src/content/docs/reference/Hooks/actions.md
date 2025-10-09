---
title: Actions
---

Actions provide a way to run custom build code such as generating binary assets like images.

Here are all the actions that come with the Style Dictionary build system. We try to include what most people might need. If you think we are missing some things, take a look at our [contributing docs](https://github.com/style-dictionary/style-dictionary/blob/main/CONTRIBUTING.md) and send us a pull request! If you have a specific need for your project, you can always create your own custom action with [`registerAction`](/reference/api#registeraction).

You use actions in your config file under platforms > [platform] > actions

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "android": {
      "transformGroup": "android",
      "files": [],
      "actions": ["copy_assets"]
    }
  }
}
```

---

## Pre-defined Actions

[lib/common/actions.js](https://github.com/style-dictionary/style-dictionary/blob/main/lib/common/actions.js)

### android/copyImages

Action to copy images into appropriate android directories.

---

### copy_assets

Action that copies everything in the assets directory to a new assets directory in the build path of the platform.

---
