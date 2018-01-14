"use strict";

let Pass = require('@superguigui/wagner/src/Pass.js');

let vertex = require('./basic.glsl');
let fragment = require('./sharpen-fs.glsl');

function SharpenPass(){

	Pass.call(this);
	this.setShader(vertex, fragment);

};

SharpenPass.prototype = Object.create(Pass.prototype);

SharpenPass.prototype.constructor = SharpenPass;

module.exports = SharpenPass;
