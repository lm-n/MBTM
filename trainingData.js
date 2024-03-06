let acc, ctx, trainDivy = false; mbconnected = false;
let myChart;
let datalines = {x:[],y:[],z:[]};
let chartTime;
let classes = {};
let ready2train = false;
let count = 1;
let form, file;

function handleSubmit (event) {

 // Stop the form from reloading the page
 event.preventDefault();

 // If there's no file, do nothing
 if (!file.value.length) return;

 // Create a new FileReader() object
 let reader = new FileReader();

 // Setup the callback event to run when the file is read
 reader.onload = logFile;

 // Read the file
 reader.readAsText(file.files[0]);

}

function logFile (event) {
 let str = event.target.result;
 classes = JSON.parse(str);
 displayUp();
 document.getElementById("upldButton").classList.remove('hideContent');
 document.getElementById("upldButton").classList.add('showContent');
 document.getElementById("upld").classList.add('hideContent');
 document.getElementById("upld").classList.remove('showContent');
}


function displayUp(){
 document.getElementById("myClasses").innerHTML = "";
 let keyClasses =  Object.keys(classes);
 for (let i = 0; i < keyClasses.length; i++){
   createClassDiv(keyClasses[i]);
   let thisClass = keyClasses[i];
   let elementKeys = Object.keys(classes[keyClasses[i]]);
   for (let j = 0; j < elementKeys.length; j++){
     let b64 = classes[keyClasses[i]][elementKeys[j]].image;
    
     showChartImage(b64, thisClass);
   }
 }
 trainDwld();

}

function showUpload(){
 document.getElementById("upldButton").classList.add('hideContent');
 document.getElementById("upldButton").classList.remove('showContent');
 document.getElementById("upld").classList.remove('hideContent');
 document.getElementById("upld").classList.add('showContent');
 form = document.querySelector('#upload');
 file = document.querySelector('#file');
 form.addEventListener('submit', handleSubmit);

}

// download json
function downloadObjectAsJson(){
 var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(classes));
 var downloadAnchorNode = document.createElement('a');
 downloadAnchorNode.setAttribute("href",     dataStr);
 downloadAnchorNode.setAttribute("download", "mbtm.json");
 document.body.appendChild(downloadAnchorNode); // required for firefox
 downloadAnchorNode.click();
 downloadAnchorNode.remove();
}

// training data

 function trainDiv(){
 let divContent = '<button onclick="newClass()"> ➕ new class</button>';
 document.getElementById("upldButton").classList.remove('hideContent');
 document.getElementById("upldButton").classList.add('showContent');
 openAllData();
 collapseTestMdl();
 collapseUseMdl();
 document.getElementById("addClass").innerHTML = divContent;
 trainDivy = true;
}

function nameClass(){
 let className = prompt("Please enter a name for your new class (no spaces):", "Class" + count);
 let thisClassMod = className.replace(/\s/g, '');
 if (classes[thisClassMod]){
   return "errorClassName";   
 } else {
   return thisClassMod;
 }
}

function newClass(){
 let thisClass = nameClass();
 if (thisClass == "errorClassName") {
   alert("This class already exists, use a different name to create a new class");
 } else {
   let thisClassMod = thisClass.replace(/\s/g, '');
   classes[thisClassMod] = {};
   createClassDiv(thisClassMod);
 } 
}

function createClassDiv(thisClassMod) {
 let node = document.createElement("div");
 node.id = thisClassMod;
 let rec = "'" + thisClassMod + "'";
 node.innerHTML = '<div><h3 style="display: inline-block;">' + thisClassMod + '</h3><button style="display: inline-block;" class="deleteClassButton" onclick="deleteClass(' + rec + ')">❌</button></div><div id="' + thisClassMod + 'recordDiv"><button id="' + thisClassMod + 'recordButton" onClick="record(' + rec + ')">➕ new data</button></div><div id="' + thisClassMod + 'chart-wrapper"></div><div id="' + thisClassMod + 'Data"></div>';
 document.getElementById("myClasses").appendChild(node);
 count++;
}

function deleteRecentData(thisclass) {
 let confirmation = confirm("Are you sure you want to delete the most recent data point?");
 if (confirmation) {
     let keys = Object.keys(classes[thisclass]);
     if (keys.length > 0) {
         let mostRecentSampleId = keys[keys.length - 1]; // Get the sampleId of the most recent data point
         delete classes[thisclass][mostRecentSampleId]; // Delete the most recent data point

         // Check if there are no more data points left in that class
         if (Object.keys(classes[thisclass]).length === 0) {
             deleteClass(thisclass); // If no data exists for this class, delete the entire class
         } else {
             // Update the UI by removing the display element corresponding to the deleted data point
             let dataElementId = thisclass + 'Data';
             let dataElement = document.getElementById(dataElementId);
             dataElement.removeChild(dataElement.lastChild); // Remove the last child element
         } 
         trainDwld();
     } else {
         alert("No data points to delete in this class.");
     }
 }
}



function deleteClass(thisclass) {
 // Prompt the user for confirmation before deleting the class
 let confirmation = confirm("Are you sure you want to delete this class?");
 if (confirmation) {
     // Delete the class and update the UI
     delete classes[thisclass];
     let classDiv = document.getElementById(thisclass);
     classDiv.parentNode.removeChild(classDiv);
 }

 ready2train = false;
 shouldTrain();
}



function record(thisclass){
 document.getElementById(thisclass+'chart-wrapper').classList.add('chart-wrapper');
 document.getElementById(thisclass+'recordDiv').innerHTML = "🔴 recording";
 document.getElementById(thisclass+'chart-wrapper').innerHTML = '<canvas id="'+thisclass+'Canvas"></canvas>';
 ctx = document.getElementById(thisclass+'Canvas').getContext('2d');
 let chrlabels = new Array(41);
 chrlabels.fill("");
 datalines.x.push(acc.x/1024);
 datalines.y.push(acc.y/1024);
 datalines.z.push(acc.z/1024);

 let initialData = {
   labels: chrlabels,
   datasets: [{
       label: 'X',
       data: datalines.x,
       borderColor: 'red',
       fill: false,
       pointStyle: false
   }, {
       label: 'Y',
       data: datalines.y,
       borderColor: 'blue',
       fill: false,
       pointStyle: false
   },{
      label: 'Z',
      data: datalines.z,
      borderColor: 'purple',
      fill: false,
      pointStyle: false
  }]
 };


 chartTime = 1;
  // Create the chart with the initial data
 myChart = new Chart(ctx, {
   type: 'line',
   data: initialData,
   options: {
       animation: {
         duration: 0
       },
       interaction: {
         mode: 'none',  // Disable all interactions
         intersect: false  // Disable data point hover intersections
       },
       tooltips: {enabled: false},
       hover: {mode: null},
       responsive: true,
       //maintainAspectRatio: false,
       scales: {
           y: {
               min: -2,
               max: 2
           }
       }
   }
 });

 callUpdate(thisclass);
 

}

// Function to update the data and redraw the chart
function updateData(thisclass) {
    // Simulate new data
   datalines.x.push(acc.x/1024);
   datalines.y.push(acc.y/1024);
   datalines.z.push(acc.z/1024);
    // Update the chart's data
    myChart.data.datasets[0].data = datalines.x;
    myChart.data.datasets[1].data = datalines.y;
    myChart.data.datasets[2].data = datalines.z;

    // Update the chart
    myChart.update();
    callUpdate(thisclass);
}

function callUpdate(thisclass){
 setTimeout(function() {
   if (chartTime > 2000){
     stopChart(thisclass);
   } else {
     chartTime = chartTime+50;
     updateData(thisclass);
   }
 }, 50);
 //console.log(chartTime);
}


 

function stopChart(thisclass){
  let base64Image = myChart.toBase64Image();
  let thisdata = datalines;
  let imgId;
  myChart.destroy();
  myChart = null;
  ctx = null;
  datalines = {x:[],y:[],z:[]};
  document.getElementById(thisclass+'chart-wrapper').innerHTML = '';
  let rec = "'"+thisclass+"'";
  document.getElementById(thisclass+'recordDiv').innerHTML = '<button id="'+thisclass+'recordButton" onClick="record('+rec+')">➕ new data</button>';
  document.getElementById(thisclass+'chart-wrapper').classList.remove('chart-wrapper');
 
  let keys = Object.keys(classes[thisclass]);
  if (keys.length > 0) {
    let lastKey = keys[keys.length - 1];
    let num = lastKey.replace(/^el/, '');
    let newNum = parseInt(num) + 1;
    let sampleId = 'el' + newNum; 
    imgId = thisclass + sampleId;
    storeData(thisclass, thisdata, base64Image, sampleId);
    showChartImage(base64Image, thisclass, imgId);
  } else {
    let newKey = keys.length + 1;
    let sampleId = 'el' + newKey; 
    imgId = thisclass + sampleId;
    storeData(thisclass, thisdata, base64Image, sampleId);
    showChartImage(base64Image, thisclass, imgId);
  }
  
 }


 
 


function getFeatures (thisdata){
   let inputs = {
       xPeaks: calculatePeaks(thisdata.x),
       xMax: Math.max(...thisdata.x),
       xMin: Math.min(...thisdata.x),
       xStd: math.std(thisdata.x),
       yPeaks: calculatePeaks(thisdata.y),
       yMax: Math.max(...thisdata.y),
       aMin: Math.min(...thisdata.y),
       aStd: math.std(thisdata.y),
       zPeaks: calculatePeaks(thisdata.z),
       zMax: Math.max(...thisdata.z),
       zMin: Math.min(...thisdata.z),
       zStd: math.std(thisdata.z),
   };
   return inputs;
}

function storeData (thisclass, thisdata, base64Image, sampleId){
  let inputs = getFeatures(thisdata);
  let target = {class: thisclass};

  classes[thisclass][sampleId] = {data: thisdata, image: base64Image, m: [target, inputs]};

  shouldTrain();
}


function shouldTrain (){
  if (!ready2train){
     let modelClasses =  Object.keys(classes);
     let readyArr = [];

     if (modelClasses.length >= 2){
         for (let i = 0; i < modelClasses.length; i++){
             let elementKeys = Object.keys(classes[modelClasses[i]]);
             readyArr.push(elementKeys.length);
         }
         let allGreaterThanThree = readyArr.every(function(element) {
             return element > 3;
         });
   
         if (allGreaterThanThree){
           trainDwld();
         }else{
           doNotTrain();
         }
     }else{
      doNotTrain();
     }
  }
  }
   
  function doNotTrain(){
    document.getElementById("trainButtonDiv").innerHTML = ''; // Remove the "Train Model" button
   
  }


function trainDwld() {
     document.getElementById("dwnld").innerHTML = '<button id="dwnldButton" onClick="downloadObjectAsJson()">Download all data</button>';
     ready2train = true;
     openTrainMdl();
     document.getElementById("trainButtonDiv").innerHTML = '<button id="trainButton" onClick="setNeuralNetwork()">Train Model</button>';

}


function calculatePeaks(array) {
   var peaks = [];
 
   for (var i = 1; i < array.length - 1; i++) {
     var currentValue = array[i];
     var prevValue = array[i - 1];
     var nextValue = array[i + 1];
 
     if (currentValue > prevValue && currentValue > nextValue) {
       peaks.push(currentValue);
     }
   }
   //return the number of peaks 
   return peaks.length;
}
 

function showChartImage(b64, thisclass, imgId){

 var imageContainer = document.getElementById(thisclass+'Data');
 //imageContainer.innerHTML = '';
 var div = document.createElement('div'); 
 div.id = imgId + '_div'; //add id to the div
 div.setAttribute('style', 'position: relative; display: inline-block;'); 
 div.innerHTML = '<img src="' + b64 + '" id="'+imgId+'_img" style=" height:125px;" </img>' + 
 '<button class ="deleteButton" style="position: absolute; top: 0; right: -10;" onClick="deleteDataPoint(\'' + thisclass + '\', \'' + imgId + '\')">❌</button>' 
 
 imageContainer.appendChild(div);
}

function deleteDataPoint(thisclass, imgId) {
 let confirmation = confirm("Are you sure you want to delete this data point?");
 if (confirmation) {
   let sampleId = imgId.replace(thisclass, '');
   delete classes[thisclass][sampleId];
   // update UI
   let dataElement = document.getElementById(imgId+'_div');
   dataElement.parentNode.removeChild(dataElement);
   
   ready2train = false;
   shouldTrain();
 }
}


function disconnect (){
 alert("microBit disconnected! Please pair your microBit again!");
 document.getElementById('connectMicro').innerHTML = '<button id="searchButton" onClick="searchDevice()"> Pair your microBit</button>'
 openConnect();
}


// Start the microBit
microBit=new uBitWebBluetooth();
plotReady = false;
console.log("mbit",microBit);
microBit.onConnect(function(){
  console.log("connected");

  document.getElementById("connected").innerHTML="true";
  document.getElementById("properties").classList.toggle('inactive');

});

microBit.onDisconnect(function(){
  mbconnected = false;
  console.log("disconnected");
  alert("microBit disconnected! Please pair your microBit again!");
  document.getElementById('connectMicro').innerHTML = '<button id="searchButton" onClick="searchDevice()"> Pair your microBit</button>'
  openConnect();
  collapseAllDataDISC();
  collapseUseMdlDISC();
  collapseTestDISC();
});

function searchDevice(){
  microBit.searchDevice();
}

microBit.onBleNotify(function(){
 if (!mbconnected){
   document.getElementById("connectMicro").innerHTML =  "Your microBit is connected!";
   mbconnected = true;
   collapseConnect();
   openAllData();
   collapseTestMdl();
   collapseUseMdl();
 }
 acc = microBit.getAccelerometer();
  //console.log(acc);
 if (!trainDivy){
   trainDiv();
 } 
});
