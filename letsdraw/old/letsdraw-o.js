/*
The variables which are used in this application
*/
var canvas;
var context;
var canvasWidth = 300;
var canvasHeight = 220;
var padding = 0;
var lineWidth = 8;
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";
var outlineImage = new Image();
var crayonImage = new Image();
var markerImage = new Image(); 
var eraserImage = new Image();
var crayonBackgroundImage = new Image();
var markerBackgroundImage = new Image();
var eraserBackgroundImage = new Image();
var crayonTextureImage = new Image();
var clickX = new Array();
var clickY = new Array();
var clickColor = new Array();
var clickTool = new Array();
var clickSize = new Array();
var clickDrag = new Array();
var paint = false;
var curColor = colorPurple;
var curTool = "crayon";
var curSize = "normal";
var mediumStartX = 18;
var mediumStartY = 19;
var mediumImageWidth = 93;
var mediumImageHeight = 46;
var drawingAreaX = 1;
var drawingAreaY = 0;
var drawingAreaWidth = 267;
var drawingAreaHeight = 200;
var totalLoadResources = 1;
var curLoadResNum = 0;
var image = "images/watermelon-duck-outline.png";

 document.addEventListener("touchmove",function(event){
      if(//check if the absolute value
           of last touch.x -current touch.x 
           is greater than some threshhold){

            event.preventDefault();
       }
  });

/*
Function to check whether the total amount of resources are loaded
*/
function resourceLoaded()
{
	if(++curLoadResNum >= totalLoadResources){
		redraw();
	}
}

/*
Function to initialize the canvas and track mouse behaviour
*/
function prepareCanvas()
{
	var canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement('canvas');
	}
	context = canvas.getContext("2d");
	
	outlineImage.onload = function() { resourceLoaded(); 
	};
	outlineImage.src = image;


	// When one of the buttons is clicked change the variable to that specific one
	$('#canvas').mousedown(function(e){
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
	});

	// When we are in paint modus, add a click
	$('#canvas').mousemove(function(e){
		if(paint){
			addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
			redraw();
		}
		e.preventDefault();
	});

	// When the mouse button is not pressed anymore, we are not painting
	$('#canvas').mouseup(function(e){
		paint = false;
		redraw();
	});

	// When the mouse leaves the canvas, not painting anymore
	$('#canvas').mouseleave(function(e){
  		paint = false;
	});
}

/*
This functions is called to add a click
The array of all the tools are updated with the specific 
attributes of that click
*/
function addClick(x, y, dragging)
{
  	clickX.push(x);
  	clickY.push(y);
  	clickDrag.push(dragging);
  	clickTool.push(curTool);
    clickColor.push(curColor);
    clickSize.push(curSize);
}

/*
Function to clear the canvas
*/
function clearCanvas()
{
	clickX.length = 0;
  	clickY.length = 0;
  	clickDrag.length = 0;
  	clickTool.length = 0;
    clickColor.length = 0;
    clickSize.length = 0;
    redraw();
}

/*
Get the dog image to draw
*/
function dog() 
{
	if(outlineImage.src != "images/dog.jpg") {
		clearCanvas();
		outlineImage.src = "images/dog.jpg";
	}
}

/*
Get the duck image to draw
*/
function duck()
{
	if(outlineImage.src != "images/watermelon-duck-outline.png") {
		clearCanvas();
		outlineImage.src = "images/watermelon-duck-outline.png";
	}
}

/*
This function is called when a click is added. 
The canvas is cleared and drawn again using the different arrays,
now containing everything up to the last click
*/
function redraw(){
	context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
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
}