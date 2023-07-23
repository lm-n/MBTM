 let acc, ctx, trainDivy = false; mbconnected = false;
 let myChart;
 let datalines = {x:[],y:[],z:[]};
 let chartTime;
 let classes = {};
 let ready2train = false;
 let count = 1;

 function trainDiv(){
  let divContent = '<button onclick="newClass()"> ➕ new class</button>';
  openAllData();
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
    let node = document.createElement("div");
    node.id = thisClassMod;
    let rec = "'"+thisClassMod+"'";
    node.innerHTML = '<h3>'+thisClass+'</h3><div id = "'+thisClassMod+'recordDiv"><button id="'+thisClassMod+'recordButton" onClick="record('+rec+')">➕ new data</button></div><div id="'+thisClassMod+'chart-wrapper"></div><div id="'+thisClassMod+'Data"></div>';
    document.getElementById("myClasses").appendChild(node)
    count++;
  } 
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
  myChart.destroy();
  myChart = null;
  ctx = null;
  datalines = {x:[],y:[],z:[]};
  document.getElementById(thisclass+'chart-wrapper').innerHTML = '';
  let rec = "'"+thisclass+"'";
  document.getElementById(thisclass+'recordDiv').innerHTML = '<button id="'+thisclass+'recordButton" onClick="record('+rec+')">➕ new data</button>';
  document.getElementById(thisclass+'chart-wrapper').classList.remove('chart-wrapper');
  if (Object.keys(classes[thisclass]).length === 0){
    let sampleId = 'el'+1; 
    storeData(thisclass, thisdata, base64Image, sampleId);
  } else{
    let keys = Object.keys(classes[thisclass]);
    let lastKey = keys[keys.length - 1];
    let newKey = parseInt(lastKey.replace(/^el/, '')) + 1;
    let sampleId = 'el' + newKey; 
    storeData(thisclass, thisdata, base64Image, sampleId);
  }
  //classes[thisclass][] = {data:'', image: base64Image};
  showChartImage(base64Image, thisclass);

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
                ready2train = true;
                openTrainMdl();
                document.getElementById("trainButtonDiv").innerHTML = '<button id="trainButton" onClick="setNeuralNetwork()">Train Model</button>';
            }
        }
    }
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
  

function showChartImage(b64, thisclass){
  var img = document.createElement('img');
  img.src = b64;
  img.style.height=125;
  var imageContainer = document.getElementById(thisclass+'Data');
  //imageContainer.innerHTML = '';
  imageContainer.appendChild(img);

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
   console.log("disconnected");
   document.getElementById("connected").innerHTML="false";
 });
 
 function searchDevice(){
   microBit.searchDevice();
 }
 
 microBit.onBleNotify(function(){
  if (!mbconnected){
    document.getElementById("connectMicro").innerHTML =  "Your microBit is connected!";
    mbconnected = true;
    collapseConnect();
  }
  acc = microBit.getAccelerometer();
   //console.log(acc);
  if (!trainDivy){
    trainDiv();
  } 
 });
