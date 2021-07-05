# Virtuosity (WORK IN PROGRESS)
If you find any bugs, please open an issue on the [github page](https://github.com/12Thanjo/virtuosity/issues).


Virtuosity is a free, open source game engine that is puts all of the systems that I have built / found together in one easy place. It is designed to make game development faster and easer by automatically doing all of the annoying stuff. Virtuosity is designed for the intended use in [Electron](https://www.electronjs.org/), although other environments could work (see [requirements](#requirements)). 

#### Rendering
Virtuosity uses [Babylonjs 4.1](https://www.npmjs.com/package/babylonjs) for 3d rendering and [Pixi 5.3.7](https://www.npmjs.com/package/pixi.js) for 2d rendering. Virtuosity also uses [howler.js 2.2.1](https://www.npmjs.com/package/howler) for audio.

## Download Virtuosity

Install via [npm](https://www.npmjs.com):

```bash
npm install virtuosity
```

<a name="requirements"></a>

## Requirements

- Support for Canvas Tag
- Support for Input Tag
- ES6 Javascript
- NodeJS functionality such as ```require()``` and the libraries like ```'fs'``` and ```'http'```

<a name = "Usage"></a>

## Usage

```js
var virtuosity = require('virtuosity');
```




<a name="API"></a>
# API
All of the documentation is on the [Virtuosity website](https://12thanjo.github.io/virtuosity/documentation/virtuosity.html).



### Included with Github Repo
- The full API documentation
- Sublime Text Completions for the Virtuosity Engine (found in the documentation folder)