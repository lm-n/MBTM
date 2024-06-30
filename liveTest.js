let rawTestData = {x:[],y:[],z:[]};
let dataStream = false, resultTestChart = false, resultUseChart = false, testChart, useChart, cux, cvx, modeUse = false, modeTest = false;
//let confidenceData = {};
let prevLabel = "";
let maxLabel = "";

function useModel(){
    getRawData();
    dataStream = true;
    document.getElementById("useButtonDiv").innerHTML = '<button id="LiveUseOffButton" onClick="useDataStreamOff()">Stop sending data</button>';
    document.getElementById("useChart").innerHTML = '<canvas id="useConfidence"></canvas>';
    document.getElementById("useChart").classList.add('chart-wrapper');
    modeUse = true;
}

function liveTest() {
    getRawData();
    dataStream = true;
    document.getElementById('testModelButtonDiv').innerHTML = '<button id="LiveTestOffButton" onClick="testDataStreamOff()">Stop Testing</button>';
    document.getElementById("testChart").innerHTML = '<canvas id="testConfidence"></canvas>';
    document.getElementById("testChart").classList.add('chart-wrapper');
    modeTest = true;
}


function testDataStreamOff() {
    if (testChart) {
        resultTestChart = false;
        testChart.destroy();
        testChart = null;
    }
    cux = null;
    if (!modeUse) {
        dataStream = false;
    }
    modeTest = false;
    document.getElementById("testChart").innerHTML = '';
    document.getElementById("testChart").classList.remove('chart-wrapper');
    document.getElementById('testModelButtonDiv').innerHTML = '<button id="LiveTestButton" onClick="liveTest()">Live Test</button>';
}


function useDataStreamOff() {
    if(useChart) {
        resultUseChart = false;
        useChart.destroy();
        useChart = null;
    }

    cvx = null;
   
    if (!modeTest){
        dataStream = false;
    }
    modeUse = false;
    document.getElementById("useChart").innerHTML = '';
    document.getElementById("useChart").classList.remove('chart-wrapper');
    document.getElementById('useButtonDiv').innerHTML ='<button id="LiveUseButton" onClick="useModel()">Use model to send data to microBit</button>';
}

function getRawData() {
    setTimeout(function() {
        if (dataStream){
            if (rawTestData.x == [] || rawTestData.x.length<41){
                rawTestData.x.push(acc.x/1024);
                rawTestData.y.push(acc.y/1024);
                rawTestData.z.push(acc.z/1024);
            } else if (rawTestData.x.length==41){
                rawTestData.x.shift();
                rawTestData.y.shift();
                rawTestData.z.shift();
                rawTestData.x.push(acc.x/1024);
                rawTestData.y.push(acc.y/1024);
                rawTestData.z.push(acc.z/1024);
                liveClassify(rawTestData);
            } 
            getRawData();
        }
    }, 50);
}

function liveClassify(testData){
    let input = getFeatures(testData);
    thisModel.classify(input, gotResult);
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    } else {
        console.log(results);
        let hasInvalidConfidence = results.some(result => isNaN(result.confidence) || result.confidence === null);// Check if the confidence of any class is NaN or null

        if (hasInvalidConfidence) {
            let confirmation = window.confirm("Some classes have invalid confidence values and can be fixed by diversifying your data. Either create a new class or increase the diversity in your existing classes.");

            if (confirmation) {
                console.log("hello")
                testDataStreamOff();
                useDataStreamOff();
            }
        } else {
            if (modeTest){
                if (!resultTestChart){
                    createTestChart(results);
                } else {
                    updateTestChart(results);
                }
            }
            if (modeUse){
                if (!resultUseChart){
                    createUseChart(results);
                } else {
                    updateUseChart(results);
                }
            }
        }
    }
}

function updateTestChart(results){
    //console.log(results[0].label);
    let dta = [];
    if (testChart != null){
        for (let j = 0; j < thisModelClasses.length; j++){
            for (let i = 0; i < results.length; i++){
                if (thisModelClasses[j] == results[i].label){
                    let val = results[i].confidence
                    val = Math.round(val*100);
                    dta.push(val);
        }}}
        testChart.data.datasets[0].data = dta;
        testChart.update();
    }
}

/* from phil
function updateTestChart(results) {
    //console.log(results[0].label);
    let dta = [];
    let max = Number.MIN_VALUE;
    for (let j = 0; j < thisModelClasses.length; j++) {
        for (let i = 0; i < results.length; i++) {
            console.log("thisModel: " + thisModelClasses[j]);
            console.log("result: " + results[i].label);
            if (thisModelClasses[j] == results[i].label) {
                console.log("Update val");
                let val = results[i].confidence
                val = Math.round(val * 100);
                dta.push(val);
                if (val > max) {
                    console.log("Update max");
                    max = val;
                    maxLabel = results[i].label;
                }
            }
        }
    }
    if (testChart != null) {
        testChart.data.datasets[0].data = dta;
        testChart.update();
    }

}*/


function updateUseChart(results){
    //console.log(results[0].label);
    let dta = [];
    if (useChart != null){
        for (let j = 0; j < thisModelClasses.length; j++){
            for (let i = 0; i < results.length; i++){
                if (thisModelClasses[j] == results[i].label){
                    let val = results[i].confidence
                    val = Math.round(val*100);
                    dta.push(val);
        }}}
        useChart.data.datasets[0].data = dta;
        useChart.update();
        sendtoMB(results[0].label);
    }
}

/* from Phil
function updateUseChart(results) {
    //console.log(results[0].label);
    let dta = [];
    let max = Number.MIN_VALUE;


    for (let j = 0; j < thisModelClasses.length; j++) {
        for (let i = 0; i < results.length; i++) {
            if (thisModelClasses[j] == results[i].label) {
                console.log("Update val");
                let val = results[i].confidence
                val = Math.round(val * 100);
                dta.push(val);
                if (val > max) {
                    console.log("Update max");
                    max = val;
                    maxLabel = results[i].label;
                }
            }
        }
    }
    if (useChart != null) {
        useChart.data.datasets[0].data = dta;
        useChart.update();
        sendtoMB(results[0].label);
    }
}*/ 




function createTestChart(results){
    cux = document.getElementById('testConfidence').getContext('2d');
    let dta = [];
        for (let j = 0; j < thisModelClasses.length; j++){
            for (let i = 0; i < results.length; i++){
                if (thisModelClasses[j] == results[i].label){
                    let val = results[i].confidence
                    val = Math.round(val*100);
                    dta.push(val);
        }}}

        var chartData = {
            labels: thisModelClasses,
            datasets: [{
                label: 'Confidence',
                data: dta,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
        // Chart options
        var chartOptions = {
            interaction: {
                mode: 'none',  // Disable all interactions
                intersect: false  // Disable data point hover intersections
            },
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    min: 0,   // Set the minimum value of the y-axis
                    max: 100 
                },
                y: {
                    beginAtZero: true
                }
            }
        };
        if (testChart!=null){
            testChart.destroy();
            testChart = null;
        }
        // Create the horizontal bar chart
        testChart = new Chart(cux, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
        resultTestChart = true;
}


/* from Phil
function createTestChart(results) {
    if (document.getElementById('useConfidence') != null) {
        cux = document.getElementById('testConfidence').getContext('2d');
    }
    let dta = [];
    let max = Number.MIN_VALUE;
    for (let j = 0; j < thisModelClasses.length; j++) {
        for (let i = 0; i < results.length; i++) {
            console.log("thisModel: " + thisModelClasses[j]);
            console.log("result: " + results[i].label);
            if (thisModelClasses[j] == results[i].label) {
                console.log("Update val");
                let val = results[i].confidence
                val = Math.round(val * 100);
                dta.push(val);
                if (val > max) {
                    console.log("Update max");
                    max = val;
                    maxLabel = results[i].label;
                }
            }
        }
    }

    if (document.getElementById('useConfidence') != null) {
        var chartData = {
            labels: thisModelClasses,
            datasets: [{
                label: 'Confidence',
                data: dta,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
        // Chart options
        var chartOptions = {
            interaction: {
                mode: 'none',  // Disable all interactions
                intersect: false  // Disable data point hover intersections
            },
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    min: 0,   // Set the minimum value of the y-axis
                    max: 100
                },
                y: {
                    beginAtZero: true
                }
            }
        };
        if (testChart != null) {
            testChart.destroy();
            testChart = null;
        }
        // Create the horizontal bar chart
        testChart = new Chart(cux, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
        resultTestChart = true;
    }
} */

function createUseChart(results){
    cvx = document.getElementById('useConfidence').getContext('2d');
        let dta = [];
        for (let j = 0; j < thisModelClasses.length; j++){
            for (let i = 0; i < results.length; i++){
                if (thisModelClasses[j] == results[i].label){
                    let val = results[i].confidence
                    val = Math.round(val*100);
                    dta.push(val);
                }
            }
        }

        var chartData = {
            labels: thisModelClasses,
            datasets: [{
                label: 'Confidence',
                data: dta,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        // Chart options
        var chartOptions = {
            interaction: {
                mode: 'none',  // Disable all interactions
                intersect: false  // Disable data point hover intersections
            },
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    min: 0,   // Set the minimum value of the y-axis
                    max: 100 
                },
                y: {
                    beginAtZero: true
                }
            }
        };

        if (useChart!=null){
            useChart.destroy();
            useChart = null;
        }

        // Create the horizontal bar chart
        useChart = new Chart(cvx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
        resultUseChart = true;
}

/*
function createUseChart(results) {
    cvx = document.getElementById('useConfidence').getContext('2d');
    let dta = [];
    let max = Number.MIN_VALUE;
    for (let j = 0; j < thisModelClasses.length; j++) {
        for (let i = 0; i < results.length; i++) {
            if (thisModelClasses[j] == results[i].label) {
                console.log("Update val");
                let val = results[i].confidence
                val = Math.round(val * 100);
                dta.push(val);
                if (val > max) {
                    console.log("Update max");
                    max = val;
                    maxLabel = results[i].label;
                }
            }
        }
    }

    var chartData = {
        labels: thisModelClasses,
        datasets: [{
            label: 'Confidence',
            data: dta,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    // Chart options
    var chartOptions = {
        interaction: {
            mode: 'none',  // Disable all interactions
            intersect: false  // Disable data point hover intersections
        },
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {
                min: 0,   // Set the minimum value of the y-axis
                max: 100
            },
            y: {
                beginAtZero: true
            }
        }
    };

    if (useChart != null) {
        useChart.destroy();
        useChart = null;
    }

    // Create the horizontal bar chart
    useChart = new Chart(cvx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
    resultUseChart = true;
}*/



function sendtoMB(label){
    if (prevLabel!=label) {
        prevLabel=label;
        microBit.writeUARTData(prevLabel);    
        // console.log(prevLabel);
    }
}

