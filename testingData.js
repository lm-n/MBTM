function testDiv() {
    let divContent = '';
    document.getElementById("upldButton").classList.remove('hideContent');
    document.getElementById("upldButton").classList.add('showContent');
    openTestData();
    document.getElementById("addTestClass").innerHTML = divContent;
    testDivy = true;
}

async function storeTestData(thisclass, thisdata, base64Image, sampleId) {
    let inputs = getFeatures(thisdata);
    let target = { class: thisclass };
    modeTest = true;
    let predIcon = '';
    if (trained){
        let thisprediction = await classifySample(thisdata);
        console.log(thisprediction);
        let testclass = thisclass.substring(0, thisclass.length - 4);
        if (thisprediction === testclass) {
            thisprediction = 1;
            predIcon = '✅';
        } else {
            thisprediction = -1;
            predIcon = '❌';
        }
        
        testingData[thisclass][sampleId] = { data: thisdata, image: base64Image, m: [target, inputs], prediction: thisprediction };  

        if (!(thisclass in testingAccuracy)) {
            console.log("Add new")
            testingAccuracy[thisclass] = 0;
        }

        calculateAccuracy(thisclass); 
    } else {
        testingData[thisclass][sampleId] = { data: thisdata, image: base64Image, m: [target, inputs]};
        document.getElementById(thisclass + 'Accuracy').innerHTML = 'train a model to calculate accuracy';    
    }
    console.log("Test Accuracy: ", testingAccuracy[thisclass]);

    datalines = { x: [], y: [], z: [] };
    document.getElementById(thisclass + sampleId + '_pred').innerHTML = predIcon;
}

function classifySample(testData) {
    data = getFeatures(testData);
    return new Promise((resolve) => {
        thisModel.classify(data, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                console.log(result[0].label);
                resolve(result[0].label);
            }

        });
    });
}

function calculateAccuracy(thisclass) {
    let sum = 0;

    let elementKeys = Object.keys(testingData[thisclass]);
    for (let j = 0; j < elementKeys.length; j++) {
      let prediction = testingData[thisclass][elementKeys[j]].prediction;

      if (prediction == 1) {
        sum++;
      }
    }

    testingAccuracy[thisclass] = (sum / elementKeys.length).toFixed(2);
    document.getElementById(thisclass + 'Accuracy').innerHTML = testingAccuracy[thisclass]; 
}