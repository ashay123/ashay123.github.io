var imgnames = ["2017_42277132.jpg", "2017_38488189.jpg", "2017_15624433.jpg", "2017_15587536.jpg", "2017_69552546.jpg", "2017_36914623.jpg", "2017_38400225.jpg", "2017_48363578.jpg", "2017_49101694.jpg", "2017_63706376.jpg"];
var imgcount = 0;
var imgloc = "images/taskimages/";
var img = document.createElement("img");
imgname = imgnames[imgcount];
img.src = imgloc+imgname;
// img.src  = "images/485762_stock-photo-state-id-card.jpg"
img.id = "test"

var src = document.getElementById("origimage");
src.appendChild(img);
var width = img.width;
var height = img.height;

const canvas2 = document.getElementById("canvas");
const context2 = canvas.getContext("2d");
var modal = document.getElementById("myModal");
var instructions = document.getElementById("instruction");
var span = document.getElementsByClassName("close")[0];
var btn = document.getElementById("myBtn");
var time = 0;
var pid = "";
var attentioncheck = false;


window.onload = function() {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = document.getElementById("test");
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0);
    addAttributes();
    addExamples();
    time = Date.now();
    document.getElementById("imageno").innerHTML = "Image "+ (imgcount+1) + " of " + imgnames.length;
    pid = window.localStorage.getItem("PID");
}

span.onclick = function() {
    instructions.style.display = "none";
}

btn.onclick = function() {
    instructions.style.display = "block";
}

const annotation = {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          label: "",
          imgname: img.src,
          printCoordinates: function () {
            console.log(`X: ${this.x}px, Y: ${this.y}px, Width: ${this.w}px, Height: ${this.h}px`);
          }
        };

//the array of all rectangles
let boundingBoxes = [];
// the actual rectangle, the one that is being drawn
let o={};


// a variable to store the mouse position
let m = {},
// a variable to store the point where you begin to draw the rectangle    
start = {};
// a boolean 
let isDrawing = false;

function showElements() { 
    var q21 = document.getElementById("q2-1");
    q21.style.display = "block";
    var q2 = document.getElementById("q2");
    q2.style.display = "block";
    var q3 = document.getElementById("q3");
    q3.style.display = "block";
    var q4 = document.getElementById("q4");
    q4.style.display = "block";
    var q5 = document.getElementById("q5");
    q5.style.display = "block";
}

function hideElements() {
    var q21 = document.getElementById("q2-1");
    q21.style.display = "none";
    var q2 = document.getElementById("q2");
    q2.style.display = "none";
    var q3 = document.getElementById("q3");
    q3.style.display = "none";
    var q4 = document.getElementById("q4");
    q4.style.display = "none";
    var q5 = document.getElementById("q5");
    q5.style.display = "none";
}

function handleMouseDown(e) {
  start = oMousePos(canvas2, e);
  isDrawing = true; 
  //console.log(start.x, start.y);
  canvas2.style.cursor = "crosshair";
}

function handleMouseMove(e) { 
    if(isDrawing){
    m = oMousePos(canvas2, e);
    draw();
    }
}

function handleMouseUp(e) { 
    canvas2.style.cursor = "default";
    isDrawing = false;

    modal.style.display = "block";
}

function undo() {
    boundingBoxes.pop();
    ul = document.getElementById('ul');
    ul.removeChild(ul.lastChild);
    draw();
}

function submit() {
    console.log(boundingBoxes);
    var ele = document.getElementsByTagName('input');
    var pi = "";
    var stillpi = "";
    var privAttributes = [];
    var remarks = document.getElementsByName("explanation")[0].value;
    var taskLength = Date.now() - time;
    var piselected = 0;
    for(i = 0; i < ele.length; i++) {
        if(ele[i].type==="checkbox") {
            if(ele[i].checked) {
                privAttributes.push(ele[i].value);
            }
        }
        if(ele[i].type==="radio") {
            if(ele[i].checked){
                if(ele[i].id === "pi") {
                    pi = ele[i].value;
                    if (pi === "Yes") piselected=1;
                    if (pi === "No") piselected=2;
                }
                if(ele[i].id === "stillpi"){ 
                    stillpi = ele[i].value;
                }
            }
        }
    }
    if (piselected ===0){
        alert("Question 1 is not filled in!");
        return;
    }
    if (piselected===1 && boundingBoxes.length ===0) {
        alert("Question 2 is not answered!");
        return;
    }
    if (piselected===1 && stillpi==="") {
        alert("Question 4 is not filled in!");
        return;
    }
    var data={
        "imgname": imgname,
        "containsPI": pi,
        "bboxes": boundingBoxes,
        "privattr": privAttributes,
        "stillpriv": stillpi,
        "remarks": remarks,
        "tasktime-ms": taskLength,
        "proid": pid
    }
    console.log(JSON.stringify(data));

    (async () => {
        const rawResponse = await fetch("https://nodejs-server-315509.ew.r.appspot.com/privacytask", {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(data)
        });
      })();
    ++imgcount;
    if(imgcount < imgnames.length){
        imgname = imgnames[imgcount];
        img.src = imgloc+imgname;
        img.onload = function() {
            var c = document.getElementById("canvas");
            c.width = img.width;
            c.height = img.height;
            var ctx = c.getContext("2d");
            ctx.drawImage(img,0,0);
            
        }
        boundingBoxes = [];
        var ul = document.getElementById('ul'); //ul
        while(ul.firstChild) ul.removeChild(ul.lastChild);
        var ele = document.getElementsByClassName("form-check-input");
        for(var i=0;i<ele.length;i++){
            ele[i].checked = false;
        }
        // resetcanvas();
        time = Date.now();
        scroll(0,0)
        document.getElementsByName("explanation")[0].value = "";
        hideElements();
        document.getElementById("imageno").innerHTML = "Image "+ (imgcount+1) + " of " + imgnames.length;
        if(imgcount ===9) document.getElementById("submitbutton").innerHTML = "Submit";
    } else {
        location.replace("end.html");
    } 
}

function selectLabel() {
    var option = document.getElementById("ddmenu");
    var value = document.getElementById("ddmenu").selectedIndex;
    var text=option.options[value].text;
    if(value === 0) {
        alert("Select a label!");
    } else if (text==="Other") {

    } else {
        const box = Object.create(annotation);
        box.x = o.x;
        box.y = o.y;
        box.w = o.w;
        box.h = o.h;
        box.label = text;

        addItem(text);
        document.getElementById("ddmenu").selectedIndex = 0;
        boundingBoxes.push(box);
        draw();
        box.printCoordinates();
        console.log(boundingBoxes)
        modal.style.display = "none";
    }
}

function cancelLabel() {
    draw();
    modal.style.display = "none";
}

function draw() {  
    o.x = start.x;  // start position of x
    o.y = start.y;  // start position of y
    o.w = m.x - start.x;  // width
    o.h = m.y - start.y;  // height

    //clearcanvas();
    context2.clearRect(0, 0, canvas2.width, canvas2.height);//////***********
    
    var xd = document.getElementById("test");
    context2.drawImage(xd, 0, 0)
    // draw all the rectangles saved in the rectsRy
    boundingBoxes.map(r => {drawRect(r)})
    // draw the actual rectangle
    drawRect(o); 
}

canvas2.addEventListener("mousedown", handleMouseDown);

canvas2.addEventListener("mousemove", handleMouseMove);

canvas2.addEventListener("mouseup", handleMouseUp);

function savecanvas(){
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    var savedBoxes = boundingBoxes.slice(0);
    console.log(savedBoxes); // ok
    }

function resetcanvas(){
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    boundingBoxes.length = 0;
    console.log(boundingBoxes); // ok
    }

function drawRect(o){
        context2.strokeStyle = "limegreen";
        context2.lineWidth = 2;
        context2.beginPath(o);
        context2.rect(o.x,o.y,o.w,o.h);
        context2.stroke();
    }

// Function to detect the mouse position

function oMousePos(canvas2, evt) {
  let ClientRect = canvas2.getBoundingClientRect();
    return { 
    x: Math.round(evt.clientX - ClientRect.left),
    y: Math.round(evt.clientY - ClientRect.top)
  }
}


var textattributes = [
    "Location",
    "Home Address",
    "Name",
    "Birth Date",
    "Phone no.",
    "Landmark",
    "Date/Time",
    "Email address"
]

var visattributes = [
    "Face",
    "License Plate",
    "Person",
    "Nudity",
    "Handwriting",
    "Physical Disability",
    "Medical History",
    "Fingerprint",
    "Signature"
]

var multiattributes = [
    "Credit Card",
    "Passport",
    "Mail",
    "Receipt",
    "Drivers License",
    "Student ID",
    "Ticket"
]

var attributes = [
    "a105_face_all", 
    "a106_address_current_all", 
    "a107_address_home_all", 
    "a108_license_plate_all", 
    "a109_person_body", 
    "a110_nudity_all", 
    "a111_name_all", 
    "a18_ethnic_clothing", 
    "a24_birth_date", 
    "a26_handwriting", 
    "a29_ausweis", 
    "a30_credit_card", 
    "a31_passport", 
    "a32_drivers_license", 
    "a33_student_id", 
    "a35_mail", 
    "a37_receipt", 
    "a38_ticket", 
    "a39_disability_physical", 
    "a43_medicine", 
    "a49_phone", 
    "a70_education_history", 
    "a73_landmark", 
    "a7_fingerprint", 
    "a82_date_time", 
    "a85_username", 
    "a8_signature", 
    "a90_email"
  ]

  function addItem(label){
    var ul = document.getElementById('ul'); //ul
    var li = document.createElement('div');//li
    
    var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = label;
        checkbox.name = "checkbox-" + label;
    
    li.appendChild(checkbox);
    
    li.appendChild(document.createTextNode(label));
    if (imgcount ===2 && attentioncheck === false) {
        attentioncheck = true;
        var attcheckbox = document.createElement('input');
        attcheckbox.type = "checkbox";
        attcheckbox.value = "attcheck";
        checkbox.name = "checkbox-attcheck";
        li.appendChild(attcheckbox);
    
        li.appendChild(document.createTextNode("Please tick this box"));
    }
    ul.appendChild(li); 
}

function addAttributes(){
    var ul = document.getElementById('ddmenu');
    
    var option = document.createElement('option');
    option.disabled = true;
    option.appendChild(document.createTextNode("--Textual Labels--"));
    ul.appendChild(option);
    for (var i = 0; i < textattributes.length; i++) {
        var option = document.createElement('option');
        option.value = i+1;
        option.appendChild(document.createTextNode(textattributes[i]));
        ul.appendChild(option);
    }

    var option = document.createElement('option');
    option.disabled = true;
    option.appendChild(document.createTextNode("--Visual Labels--"));
    ul.appendChild(option);
    for (var i = 0; i < visattributes.length; i++) {
        var option = document.createElement('option');
        option.value = i+1;
        option.appendChild(document.createTextNode(visattributes[i]));
        ul.appendChild(option);
    }

    var option = document.createElement('option');
    option.disabled = true;
    option.appendChild(document.createTextNode("--Multimodal Labels--"));
    ul.appendChild(option);
    for (var i = 0; i < multiattributes.length; i++) {
        var option = document.createElement('option');
        option.value = i+1;
        option.appendChild(document.createTextNode(multiattributes[i]));
        ul.appendChild(option);
    }
    // var option = document.createElement('option');
    // option.appendChild(document.createTextNode("other, namely:"));
    // ul.appendChild(option);

}

function addExamples() {
    var ul = document.getElementById('list1');
    for (var i = 0; i < textattributes.length; i++) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(textattributes[i]));
        ul.appendChild(li);
    }
    for (var i = 0; i < visattributes.length; i++) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(visattributes[i]));
        ul.appendChild(li);
    }
    var ul2 = document.getElementById('list2');
    for (var i = 0; i < multiattributes.length; i++) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(multiattributes[i]));
        ul2.appendChild(li);
    }
}
