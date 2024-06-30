function collapseConnect(){
    document.getElementById("connectContent").classList.remove('showContent');
    document.getElementById("connectContent").classList.add('hideContent');
    document.getElementById("connectCO").innerHTML = '<a href="javascript:openConnect();">🔽</a>';
}
function openConnect(){
    document.getElementById("connectContent").classList.remove('hideContent');
    document.getElementById("connectContent").classList.add('showContent');
    document.getElementById("connectCO").innerHTML = '<a href="javascript:collapseConnect();">❎</a>';
}

function collapseAllDataDISC(){
    document.getElementById("allDataContent").classList.remove('showContent');
    document.getElementById("allDataContent").classList.add('hideContent');
    document.getElementById("allDataCO").innerHTML = '';
}

function collapseAllData(){
    document.getElementById("allDataContent").classList.remove('showContent');
    document.getElementById("allDataContent").classList.add('hideContent');
    document.getElementById("allDataCO").innerHTML = '<a href="javascript:openAllData();">🔽</a>';
}
function openAllData(){
    document.getElementById("allDataContent").classList.remove('hideContent');
    document.getElementById("allDataContent").classList.add('showContent');
    document.getElementById("allDataCO").innerHTML = '<a href="javascript:collapseAllData();">❎</a>';
}

function openTestData() {
    document.getElementById("testDataContent").classList.remove('hideContent');
    document.getElementById("testDataContent").classList.add('showContent');
    document.getElementById("testDataCO").innerHTML = '<a href="javascript:collapseAllData();">❎</a>';
}

function collapseTrainMdl(){
    document.getElementById("trainMdlContent").classList.remove('showContent');
    document.getElementById("trainMdlContent").classList.add('hideContent');
    document.getElementById("trainMdlCO").innerHTML = '<a href="javascript:openTrainMdl();">🔽</a>';
}

function openTrainMdl(){
    document.getElementById("trainMdlContent").classList.remove('hideContent');
    document.getElementById("trainMdlContent").classList.add('showContent');
    document.getElementById("trainMdlCO").innerHTML = '<a href="javascript:collapseTrainMdl();">❎</a>';
}

function collapseTestDISC(){
    document.getElementById("testMdlContent").classList.remove('showContent');
    document.getElementById("testMdlContent").classList.add('hideContent');
    document.getElementById("testMdlCO").innerHTML = '';
}

function collapseTestMdl(){
    document.getElementById("testMdlContent").classList.remove('showContent');
    document.getElementById("testMdlContent").classList.add('hideContent');
    document.getElementById("testMdlCO").innerHTML = '<a href="javascript:openTestMdl();">🔽</a>';
}

function openTestMdl(){
    document.getElementById("testMdlContent").classList.remove('hideContent');
    document.getElementById("testMdlContent").classList.add('showContent');
    document.getElementById("testMdlCO").innerHTML = '<a href="javascript:collapseTestMdl();">❎</a>';
}

function collapseUseMdlDISC(){
    document.getElementById("useMdlContent").classList.remove('showContent');
    document.getElementById("useMdlContent").classList.add('hideContent');
    document.getElementById("useMdlCO").innerHTML = '';
}

function collapseUseMdl(){
    document.getElementById("useMdlContent").classList.remove('showContent');
    document.getElementById("useMdlContent").classList.add('hideContent');
    document.getElementById("useMdlCO").innerHTML = '<a href="javascript:openUseMdl();">🔽</a>';
}

function openUseMdl(){
    document.getElementById("useMdlContent").classList.remove('hideContent');
    document.getElementById("useMdlContent").classList.add('showContent');
    document.getElementById("useMdlCO").innerHTML = '<a href="javascript:collapseUseMdl();">❎</a>';
}