// 10.5.10.47

var browserSessions = new Array();

chrome.browserAction.onClicked.addListener(function(activeTab){
  var url = "http://localhost:3000/admin/dashboard";
  chrome.tabs.create({url: url});
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });
});
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {hostEquals: 'developer.chrome.com'},
    })
    ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});

chrome.tabs.onCreated.addListener(function(tab) {
  sendPostData(tab);
});

chrome.tabs.onActivated.addListener(function(activeInfo){
  // console.warn(activeInfo);
  // sendPostData(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  // console.warn(tabId, changeInfo, tab);
});

function getHostName(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
  return match[2];
  }
  else {
      return null;
  }
}

chrome.tabs.onRemoved.addListener(function(tabId){
  var index = getIndex(tabId);
  var browserData;
  var data;
  
  var date = new Date();
  if(index !== undefined){
    browserData = browserSessions[index];
  }
  if(browserData !== undefined){
    data = {
      user: 1,
      site: browserData.hostName,
      end_time: date.toUTCString()
    }
    hitAPI(data, "POST", "https://smartgridceg.herokuapp.com/user_links/update")
  }
  console.warn(tabId, index, data, browserData);
});

/********************************** */

function getIndex(tabId) {
  for (let index = 0; index < browserSessions.length; index++) {
    // const element = browserSessions[index];
    if(browserSessions[index].id === tabId){
      return index;
    }
  }
  return undefined;
}

function sendPostData(tabInfo) {
  var date = new Date();
  var browserData = {
    id: tabInfo.id,
    startTime: date.toUTCString(),
    fullURL: tabInfo.pendingUrl,
    hostName: getHostName(tabInfo.pendingUrl)
  }
  browserSessions.push(browserData);
  var data = {user_link_id: 1,
    start_date: date.toUTCString(),
    from_url: "google.com",
    duration: 0,
    current_url: getHostName(tabInfo.pendingUrl),
    site: "Study"
  };

    hitAPI(data, "POST", "https://smartgridceg.herokuapp.com/user_links/post_updates")
  // console.warn(browserData.fullURL, browserData.startTime, browserData.hostName);
}

function sendPutData(data) {
  
}

function hitAPI(data, method, url) {
  // var xhttp = new XMLHttpRequest();
  // xhttp.onreadystatechange = function() {
  //     if (this.readyState == 4 && this.status == 200) {
  //       // Typical action to be performed when the document is ready:
  //       document.getElementById("demo").innerHTML = xhttp.responseText;
  //     }
  // };
  // xhttp.open(method, "filename", true);
  // xhttp.send();

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.warn(xmlhttp.responseText);
      // Typical action to be performed when the document is ready:
      // document.getElementById("demo").innerHTML = xhttp.responseText;
    }
  };
  xmlhttp.open(method, url);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify(data));
}