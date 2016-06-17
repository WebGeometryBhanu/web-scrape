// usage 
// script file environment url_to_test test_flag
// example phantomjs testContactSubmit.js 3 1 0

var stringify = require('json-stringify');
var fs = require('fs');
var system = require('system');
var args = system.args;

var env = [
"",
"http://www.berkeleygroup.co.uk", 
"http://webop.d.berkeleygroup.co.uk", 
"http://local.berkeleygroup.co.uk"];
//pass first parameter
var envURL = env[args[1]]

var urlDev = [
"", 
"/new-homes/london/greenwich/kidbrooke-village", 
"/new-homes/berkshire/reading/green-park-village", 
"/new-homes/london/chelsea/chelsea-creek",
"/new-homes/london/battersea/vista-chelsea-bridge",
"/new-homes/berkshire/reading/green-park-village"];

//pass second parameter
urlDevProcess = urlDev[args[2]];

console.log(envURL + urlDevProcess);

if(args[3] == 0 ) phantom.exit();

var allLinks = [{ LinkName: "Dev", LinkJSON : urlDev }]

var imageLocation = 'images\\';
var fileName;
var processingLink;
var processWidthHeight;
var objDevColour = [{}];
var ctrPage = 0;

var useragent = [];
useragent.push('Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14');
useragent.push('Opera/9.80 (X11; Linux x86_64; U; fr) Presto/2.9.168 Version/11.50');
useragent.push('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A');
useragent.push('Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25');
useragent.push('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2');
useragent.push('Mozilla/5.0 (Windows; U; Windows NT 6.1; sv-SE) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4');
useragent.push('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2');
useragent.push('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36');

var viewsize = [];
viewsize.push({width: 1280, height: 1024});
viewsize.push({width: 640, height: 480});
viewsize.push({width: 360, height: 598});
viewsize.push({width: 200, height: 598});

var deviceSize = [
{"name": "iPad Landscape", dimensions:[{"width":1024, "height":768 }]},
{"name": "iPad Potrait", dimensions:[{"width":768, "height":1024 }]}, 
{"name": "iPhone 5 Landscape", dimensions:[{"width":568, "height":320 }]},
{"name": "iPhone 5 Potrait", dimensions:[{"width":320, "height":568 }]},
{"name": "iPhone 6 Landscape", dimensions:[{"width":667, "height":375 }]},
{"name": "iPhone 6 Potrait", dimensions:[{"width":375, "height":667 }]},
{"name": "Samsung S4 Landscape", dimensions:[{"width":640, "height":360 }]},
{"name": "Samsung S4 Potrait", dimensions:[{"width":360, "height":640 }]} 
]


var page = require('webpage').create();

//Setting page size
page.settings.userAgent = useragent[6];

console.log('Loading a web page');
console.log('User agent ' + page.settings.userAgent);

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
};

page.onError = function(msg, trace) {
  console.log(msg);
  
  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }
  console.error(msgStack.join('\n'));

};

//Can be used to simulate click event
function click(el){
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}


function waitFor( page, selector, expiry, callback ) {
    system.stderr.writeLine( "- waitFor( " + selector + ", " + expiry + " )" );
 
    // try and fetch the desired element from the page
    var result = page.evaluate(
        function (selector) {
            return document.querySelector( selector );
        }, selector
    );
 
    // if desired element found then call callback after 50ms
    if ( result ) {
        system.stderr.writeLine( "- trigger " + selector + " found" );
        window.setTimeout(
            function () {
                callback( true );
            },
            50
        );
        return;
    }
 
    // determine whether timeout is triggered
    var finish = (new Date()).getTime();
    if ( finish > expiry ) {
        system.stderr.writeLine( "- timed out" );
        callback( false );
        return;
    }
 
    // haven't timed out, haven't found object, so poll in another 100ms
    window.setTimeout(
        function () {
            waitFor( page, selector, expiry, callback );
        },
        100
    );
}


// Main function to handle page scrape

function handle_page(url, isScreenCapture, screenWH) {
  page.viewportSize = screenWH;
  console.log('Opening page - ' + url);
  console.log("The current screen size is set to " + screenWH.width + " x " + screenWH.height);
 
  page.open(url, function() {

   var pageTitle = page.evaluate(function() {

      var evqArrangeView = document.createEvent("MouseEvents");
      evqArrangeView.initEvent("click", true, true);
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_ARRANGEAVIEWING").dispatchEvent(evqArrangeView);

      //Enquiries form
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_TITLE").value = "Mr";
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_FIRSTNAME").value = "Sachin";
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_LASTNAME").value = "Tendulkar";
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_EMAIL").value = "test.sachin.tendulkar@testemail.com";
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_ARRANGEAVIEWING").value = "Yes";
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_VIEWINGDATE").value = "2016-06-14";
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_VIEWINGNOTES").value = "Some testing notes bla bla ";

      var evqSubmitContact = document.createEvent("MouseEvents");
      evqSubmitContact.initEvent("click", true, true);
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_FORMACTION_FINISH").dispatchEvent(evqSubmitContact);

      var evqSubmitContact = document.createEvent("MouseEvents");
      evqSubmitContact.initEvent("click", true, true);
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_REQUESTACALLBACKLABEL").dispatchEvent(evqSubmitContact);

      var evqSubmitContact = document.createEvent("MouseEvents");
      evqSubmitContact.initEvent("click", true, true);
      document.querySelector("#ENQUIRIESANDVIEWINGSFORM_ORDERABROCHURELABEL").dispatchEvent(evqSubmitContact);

      setTimeout(function () { alert('Waited for 1 sec'); }, 1000);

      // Contact form
      document.querySelector("#DEVEMAILAFRIEND_FRIENDSNAME").value = "MS Dhoni";
      document.querySelector("#DEVEMAILAFRIEND_TOEMAILADDRESS").value = "test.ms.dhoni@testemail.com";
      document.querySelector("#DEVEMAILAFRIEND_YOURNAME").value = "Sachin Tendulkar";
      document.querySelector("#DEVEMAILAFRIEND_YOUREMAIL").value = "test.sachin.tendulkar@testemail.com";
      document.querySelector("#DEVEMAILAFRIEND_MESSAGE").value = "Some reference to this property is awsome notes bla bla ";

      var pageSubContact = document.createEvent("MouseEvents");
      pageSubContact.initEvent("click", true, true);
      document.querySelector("#DEVEMAILAFRIEND_FORMACTION_FINISH").dispatchEvent(pageSubContact);

      setTimeout(function () { alert('Waited for 1 sec'); }, 1000);

      return document.title;
      //return ($('#DEVEMAILAFRIENDFORM_SUBMIT_RESPONSE').text())

    });

    // phantom.waitFor(function() {
    //   return page.evaluate(function() {
    //     return (($('#DEVEMAILAFRIEND_FORMACTION_FINISH').text()) != " Submitting ...");
    //   })
    // });

    // phantom.waitFor(function() {
    //   return page.evaluate(function() {
    //     return ($('#DEVEMAILAFRIENDFORM_SUBMIT_RESPONSE').text().length) > 0;
    //   })
    // });


    if (isScreenCapture) {
      console.log('In the screen capture page ' + page.viewportSize.width);
      //page.render(imageLocation + pageTitle.replace("|", '-') + page.viewportSize.width + '.png');
      console.log(imageLocation + url.substring(url.lastIndexOf("/")+1) + page.viewportSize.width);
      page.render(imageLocation + url.substring(url.lastIndexOf("/")+1) + page.viewportSize.width + '.png');
    }

  setTimeout(processAllScreens, 4000);

  });

}

function processAllScreens(){
    var listWidthHeight = deviceSize.shift();
    if(!listWidthHeight){
        phantom.exit(0);
       }
    console.log(listWidthHeight["dimensions"][0].width);
    processWidthHeight = listWidthHeight["dimensions"][0];
    urlCheck = envURL + urlDevProcess

    setTimeout(handle_page(urlCheck, true, processWidthHeight), 40);
}

processAllScreens();
