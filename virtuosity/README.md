# Virtuosity (WORK IN PROGRESS)

Virtuosity is a free, open source game engine that is puts all of the systems that I have built / found together in one easy place. It is designed to make game development faster and easer by automatically doing all of the annoying stuff. Virtuosity is designed for the intended use in [Electron](https://www.electronjs.org/), although other environments could work (see [requirements](#requirements)). 

#### Rendering
Virtuosity uses [Babylonjs 4.1](https://www.npmjs.com/package/babylonjs) for 3d rendering and [Phaser-CE 2.15.1](https://www.npmjs.com/package/phaser-ce) for 2d rendering. Phaser 3.x is more feature rich and suposedly performs better, however it is not equiped for some features that are neccesary for Virtuosity. Phaser-CE is still getting support as well.

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
All of the documentation is on the [Virtuosity website](https://12thanjo.github.io/virtuosity/).