var drawingApp = (function () {

	"use strict";

	var canvas,
		context,
		canvasWidth = 490,
		canvasHeight = 220,
		colorPurple = "#cb3594",
		colorGreen = "#659b41",
		colorYellow = "#ffcf33",
		colorBrown = "#986928",
		clickX = [],
		clickY = [],
		clickColor = [],
		clickTool = [],
		clickSize = [],
		clickDrag = [],
		paint = false,
		curColor = colorPurple,
		curTool = "crayon",
		curSize = "normal",
		drawingAreaX = 111,
		drawingAreaY = 11,
		drawingAreaWidth = 267,
		drawingAreaHeight = 200,
		totalLoadResources = 1,
		curLoadResNum = 0,
		outlineImage = new Image(),
		radius = 0,

		// Clears the canvas.
		clearCanvas = function () {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
		},

		// Redraws the canvas.
		redraw = function () {
			clearCanvas();
			for(var i=0; i < clickX.length; i++) {
		  		if(clickSize[i] == "small"){
					radius = 2;
				}else if(clickSize[i] == "normal"){
					radius = 5;
				}else if(clickSize[i] == "large"){
					radius = 10;
				}else if(clickSize[i] == "huge"){
					radius = 20;
				}else{
					radius = 5;	
				}		
		    	context.beginPath();
		    	if(clickDrag[i] && i){
		      		context.moveTo(clickX[i-1], clickY[i-1]);
		     	}else{
		       		context.moveTo(clickX[i]-1, clickY[i]);
		     	}
		     	context.lineTo(clickX[i], clickY[i]);
		     	context.closePath();
		     	if(clickTool[i] == "eraser"){
					//context.globalCompositeOperation = "destination-out"; // To erase instead of draw over with white
					context.strokeStyle = 'white';
				}else if(clickTool[i] == "marker"){
					//context.globalCompositeOperation = "source-over";	// To erase instead of draw over with white
					context.globalAlpha = 1;
					context.strokeStyle = clickColor[i];
				}else{
					context.globalAlpha = 0.4;
					context.strokeStyle = clickColor[i];
				}
				context.lineJoin = "round";
		     	context.lineWidth = radius;
     			context.stroke();
  			}
	  		context.restore();
	  	
	  		context.globalAlpha = 1;
	  		context.drawImage(outlineImage, drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);
		},

		// Adds a point to the drawing array.
		// @param x
		// @param y
		// @param dragging
		addClick = function (x, y, dragging) {

			clickX.push(x);
			clickY.push(y);
			clickTool.push(curTool);
			clickColor.push(curColor);
			clickSize.push(curSize);
			clickDrag.push(dragging);
		},

		// Add mouse and touch event listeners to the canvas
		createUserEvents = function () {

			var press = function (e) {
				// Mouse down location
				var mouseX = e.pageX - this.offsetLeft;
				var mouseY = e.pageY - this.offsetTop;
				document.getElementById('brown').onclick = function() { curColor = colorBrown; }
				document.getElementById('purple').onclick = function() { curColor = colorPurple; }
				document.getElementById('yellow').onclick = function() { curColor = colorYellow; }
				document.getElementById('green').onclick = function() { curColor = colorGreen; }
				document.getElementById('crayon').onclick = function() { curTool = "crayon"; }
				document.getElementById('marker').onclick = function() { curTool = "marker"; }
				document.getElementById('eraser').onclick = function() { curTool = "eraser"; }
				document.getElementById('small').onclick = function() { curSize = "small"; }
				document.getElementById('normal').onclick = function() { curSize = "normal"; }
				document.getElementById('large').onclick = function() { curSize = "large"; }
				document.getElementById('huge').onclick = function() { curSize = "huge"; }
				paint = true;
				addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false);
				redraw();
			},

			drag = function (e) {
				
				var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
					mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
				
				if (paint) {
					addClick(mouseX, mouseY, true);
					redraw();
				}
				// Prevent the whole page from dragging if on mobile
				e.preventDefault();
			},

			release = function () {
				paint = false;
				redraw();
			},

			cancel = function () {
				paint = false;
			};

			// Add mouse event listeners to canvas element
			canvas.addEventListener("mousedown", press, false);
			canvas.addEventListener("mousemove", drag, false);
			canvas.addEventListener("mouseup", release);
			canvas.addEventListener("mouseout", cancel, false);

			// Add touch event listeners to canvas element
			canvas.addEventListener("touchstart", press, false);
			canvas.addEventListener("touchmove", drag, false);
			canvas.addEventListener("touchend", release, false);
			canvas.addEventListener("touchcancel", cancel, false);
		},

		// Calls the redraw function after all neccessary resources are loaded.
		resourceLoaded = function () {

			curLoadResNum += 1;
			if (curLoadResNum === totalLoadResources) {
				redraw();
				createUserEvents();
			}
		},

		// Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
		init = function () {

			// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
			canvas = document.createElement('canvas');
			canvas.setAttribute('width', canvasWidth);
			canvas.setAttribute('height', canvasHeight);
			canvas.setAttribute('id', 'canvas');
			document.getElementById('canvasDiv').appendChild(canvas);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvas = G_vmlCanvasManager.initElement(canvas);
			}
			context = canvas.getContext("2d"); // Grab the 2d canvas context
			// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
			//     context = document.getElementById('canvas').getContext("2d");

			// Load images
			outlineImage.onload = resourceLoaded;
			outlineImage.src = "images/watermelon-duck-outline.png";
		};

	return {
		init: init
	};
}());