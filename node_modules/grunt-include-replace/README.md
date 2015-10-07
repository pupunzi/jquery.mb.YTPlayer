# grunt-include-replace [![Build Status](https://travis-ci.org/alanshaw/grunt-include-replace.svg)](https://travis-ci.org/alanshaw/grunt-include-replace) [![devDependency Status](https://david-dm.org/alanshaw/grunt-include-replace/dev-status.svg)](https://david-dm.org/alanshaw/grunt-include-replace#info=devDependencies)

> Grunt task to include files and replace variables.

Allows for parameterised file includes:

hello.html

```html
<!DOCTYPE html>
<h1>Hello World!</h1>
@@include('/path/to/include/message.html', {"name": "Joe Bloggs"})
```

message.html

```html
<p>Hello @@name!</p>
```

Result:

```html
<!DOCTYPE html>
<h1>Hello World!</h1>
<p>Hello Joe Bloggs!</p>
```

## Getting Started

This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-include-replace --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-include-replace');
```

## The "includereplace" task


### Overview

The task allows you to preprocess your project file contents by replacing placeholder "variables" and including content from other files. In addition to "global" variables that are replaced in all files you specify, the task introduces the concept of "local" variables, which are passed as parameters to included files.

WARNING: The task _does not_ check for recursive includes.

In your project's Gruntfile, add a section named `includereplace` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  includereplace: {
    your_target: {
      options: {
        // Task-specific options go here.
      },
      // Files to perform replacements and includes with
      src: '*.html',
      // Destination directory to copy files to
      dest: 'dist/'
    }
  }
})
```

### Options

#### options.globals
Type: `Object`  
Default value: `{}`

Global variables availabe for replacement in all files.

#### options.prefix
Type: `String`  
Default value: `@@`

Variable/include directive prefix. Careful when changing as it is added to the regular expression used for finding variables to be replaced.

#### options.suffix
Type: `String`  
Default value: ``

Variable/include directive suffix. Careful when changing as it is added to the regular expression used for finding variables to be replaced.

#### options.includesDir
Type: `String`  
Default value: Relative to including file

Directory where includes will be resolved.

#### options.docroot
Type: `String`  
Default value: `.`

`@@docroot` is a magic local variable that contains the relative path from the file that uses it to the path specified.

#### options.processIncludeContents
Type: `Function`  
Default value: undefined

A function called for every included file prior to processing by `grunt-include-replace`. It is passed the include file contents and local variables as parameters and should return the (possibly altered) file contents.

### Usage Examples

#### Default Options

```js
includereplace: {
  dist: {
    options: {
      globals: {
        var1: 'one',
        var2: 'two',
        var3: 'three'
      },
    },
    src: '*.html',
    dest: 'dist/'
  }
}
```

##### Files array format

```js
includereplace: {
  dist: {
    options: {
      globals: {
        var1: 'one',
        var2: 'two',
        var3: 'three'
      },
    },
    files: [
      {src: 'js/**/*.js', dest: 'dist/', expand: true, cwd: 'src/'},
      {src: '*.css', dest: 'dist/css/', expand: true, cwd: 'src/css'}
    ]
  }
}
```

##### Files object format

```js
includereplace: {
  dist: {
    options: {
      globals: {
        var1: 'one',
        var2: 'two',
        var3: 'three'
      },
    },
    files: {
      'dist/js/': ['**/*.js', '!dist/**/*.js'],
      'dist/css/': ['**/*.css', '!dist/**/*.css']
    }
  }
}
```

#### Custom Options

The following example allows include statements to appear as comments in HTML files by altering the prefix and suffix. Also all includes are resolved relative to the directory `inc/` (relative to your Gruntfile) rather than relative to including file.

```js
includereplace: {
  dist: {
    options: {
      prefix: '<!-- @@',
      suffix: ' -->',
      includesDir: 'inc/'
    },
    src: '*.html',
    dest: 'dist/'
  }
}
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

 * 2015-02-05   v3.0.0   Better logging for missing source files
 * 2014-05-05   v2.0.0   Adds globbing on include paths
 * 2013-12-30   v1.2.0   Rename like `grunt-contrib-copy` by specifying dest filename (for single files)
 * 2013-06-19   v1.1.0   Added magic local variable `@@docroot`: relative path from the file that uses it to the path specified
 * 2013-06-19   v1.0.0   Refactored files processing code to use Grunt files API properly
 * 2013-05-03   v0.4.0   Support for cwd directive
 * 2013-04-26   v0.3.0   Added new option includesDir - if set all includes resolved relative to that directory
 * 2013-04-19   v0.2.0   Added option processIncludeContents - a function that allows you to alter included file contents
 * 2013-02-18   v0.1.0   Grunt 0.4.x support
