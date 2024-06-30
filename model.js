let thisModel;
let thisModelClasses;
let trained = false;

function trainingData(){
    
}

function setNeuralNetwork() {
    collapseAllData();
    //let dataSet = dummy; //<button  onClick="setNeuralNetwork()"> OVERIDE TRAIN</button> 
    let dataSet = classes;
    let modelClasses =  Object.keys(dataSet);
    thisModelClasses = modelClasses;
    console.log ("model classes are: " + modelClasses);
    let options = {
      inputs: [
        "xPeaks",
        "xMax",
        "xMin",
        "xStd",
        "yPeaks",
        "yMax",
        "aMin",
        "aStd",
        "zPeaks",
        "zMax",
        "zMin",
        "zStd",
      ],
      outputs: modelClasses,
      task: "classification",
      debug: "false",
      learningRate: 0.5,
    };
  
    thisModel = ml5.neuralNetwork(options);

    for (let i = 0; i < modelClasses.length; i++){
        let elements = dataSet[modelClasses[i]];
        let elementKeys = Object.keys(elements);
        for (let j = 0; j < elementKeys.length; j++){
            let datat = dataSet[modelClasses[i]][elementKeys[j]].m;
            thisModel.addData(datat[1], datat[0]);
        }
    }

    thisModel.normalizeData();
    const trainingOptions = {
        epochs: 500
    }

    thisModel.train(trainingOptions, finishedTraining);
    document.getElementById("trainButtonDiv").innerHTML =  "💪🏾💪🏽 training... 💪🏾💪🏽";

}

function finishedTraining(){
    document.getElementById('trainButtonDiv').innerHTML =  '<button id="trainButton" onClick="setNeuralNetwork()">Retrain Model</button>';
    console.log("model trained");
    trained = true;

    if (Object.keys(testingData).length > 0) {
        repredictData();
    }
    
    document.getElementById('testModelButtonDiv').innerHTML = '<button id="LiveTestButton" onClick="liveTest()">Live Test</button>';
    document.getElementById('useButtonDiv').innerHTML ='<button id="LiveUseButton" onClick="useModel()">Use model to send data to microBit</button>';
    openTestMdl();
    openUseMdl();
    collapseTrainMdl();
    enableAllRecordButtons();
}

function repredictData() {
    console.log("Repredicted data!");
    let keyClasses = Object.keys(testingData);
    if(keyClasses.length > 0){
        for (let i = 0; i < keyClasses.length; i++) {
            let thisClass = keyClasses[i];
            let elementKeys = Object.keys(testingData[thisClass]);
            for (let j = 0; j < elementKeys.length; j++) {
                let sampleId = elementKeys[j];
                let data = testingData[thisClass][sampleId].data;
                let b64 = testingData[thisClass][sampleId].image;
                console.log("store test data");
                storeTestData(thisClass, data, b64, sampleId);
            }
        }
    }
}