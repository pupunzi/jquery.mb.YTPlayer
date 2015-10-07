# grunt-build-number

> Grunt plugin for maintaining a build number in package.json (or another file)

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-build-number --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-build-number');
```

## The "build_number" task

### Overview
In your project's Gruntfile, add a section named `build_number` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  buildnumber: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

(due to how grunt handles tasks this **`buildnumber` object has to be present in the grunt configuration and has to have at least one target defined**, even when using the default options. Just leave the object empty, e.g. `buildnumber: { package:{} }`)

### Options

#### options.field
Type: `String`
Default value: `build`

A string value that is used as the name of the field in the json file to store the build number.

### Usage Examples

#### Default Options

```js
//Gruntfile.js
grunt.initConfig({
  buildnumber: {
    package : {}
  }
})
```

```sh
$ grunt buildnumber
```

The task will search for the `package.json` file in your project, load it and bump/create the `build` field. Output will be similar to:

```sh
Running "buildnumber:package" (buildnumber) task
>> Build number set to "463" in "package.json".

Done, without errors.
```

#### Custom Options

```js
grunt.initConfig({
  buildnumber: {
    options: {
      field: 'buildnum',
    },
    files: ['package.json', 'bower.json']
  }
})
```

This will update a `buildnum` field inside `package.json` and `bower.json`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* v1.0.0: initial release

## License
Copyright (c) 2014 Camille Reynders. Licensed under the MIT license.
