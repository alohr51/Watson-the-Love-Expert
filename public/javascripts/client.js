window.onload = function(){
	$("#loader").css('visibility', 'hidden');
	$("#errorDiv").css('visibility', 'hidden');
}

//Used for good looking scrol bar
$(function(){
    $('#tableDiv').slimScroll({
        height: '355px',
        width: '95%'
    });
});

function validate(){
	var twitter1=document.getElementById("twitter1").value;
	var twitter2=document.getElementById("twitter2").value;
	if (twitter1 == null || twitter1 == "" || twitter1 == undefined || twitter2 == null || 
		twitter2 == "" || twitter2 == undefined){
		showError('One or more Twitter handles are blank.');
		return false;
	}
	else{
		//remove @ if user inputted it.
		if(twitter1.charAt(0) == '@')twitter1 = twitter1.substring(1);
		if(twitter2.charAt(0) == '@')twitter2 = twitter2.substring(1);
		$("#loader").css('visibility', 'visible');
		getModelFromTweets(twitter1,twitter2);
	}
}

function showError(err){
	document.getElementById("errorDiv").innerHTML = err;
	$("#errorDiv").css('visibility', 'visible');
	$("#loader").css('visibility', 'hidden');
}

function getModelFromTweets(twitter1,twitter2){
	var isDone1 = false;
	var isDone2 = false;
	var data1 = "";
	var data2 = "";

	var tweetText1 = getTweetText(twitter1,function(result){
		//use 50 to weed out undefinedundefined error so we know it returns a bad string
		if(result.length <=50){
			showError('Could not retrieve tweets for ' + twitter1 + ' please make sure their account is not private.');
			$("#loader").css('visibility', 'hidden');
		}
		else{
			var modelInfo1 = getModelingInfo(result,function(data){
				data1 = data;
				isDone1 = true;
				if(isDone2)analyze(twitter1,data1,twitter2,data2);
			});
		}
	});

	var tweetText2 = getTweetText(twitter2,function(result){
		if(result.length <=50){
			showError('could not retrieve tweets for ' + twitter2 + ' please make sure their account is not private.');
			$("#loader").css('visibility', 'hidden');
		}
		else{
			var modelInfo2 = getModelingInfo(result, function(data){
			data2 = data;
			isDone2 = true;
			if(isDone1)analyze(twitter1,data1,twitter2,data2);
			//document.getElementById('aaa').innerHTML += '_________________________' + JSON.stringify(data);
			});
		}
	});
}

function analyze(twitter1,modelInfo1,twitter2,modelInfo2){
	//skip first one, holds no trait
	var currTrait = "";
	var person1Val = 0;
	var person2Val = 0;
	var totalDiff = 0;
	var bestMatch = {id:'',value1:0,value2:0,diff:99999};
	var worstMatch={id:'',value1:0,value2:0,diff:0};
	for(var i = 1; i < modelInfo1.traits.length; i++){
		//check traits match up
		if(modelInfo1.traits[i].id === modelInfo2.traits[i].id){
			currTrait = modelInfo1.traits[i].id;
			//remove percent sign from values so we can find the diff
			person1Val = modelInfo1.traits[i].value.slice(0, - 1);
			person2Val = modelInfo2.traits[i].value.slice(0, - 1);
			//watson returns no value for 2 traits, workaround for this "bug/feature"?
			if(person1Val.length > 0 && person2Val.length > 0){
				var diff = difference(person1Val,person2Val);

				if(diff < bestMatch.diff){
					bestMatch.id = currTrait;
					bestMatch.value1 = person1Val;
					bestMatch.value2 = person2Val;
					bestMatch.diff = diff;
				}
				if(diff > worstMatch.diff){
					worstMatch.id = currTrait;
					worstMatch.value1 = person1Val;
					worstMatch.value2 = person2Val;
					worstMatch.diff = diff;
				}

				totalDiff += diff;				
			}
		}
		else{
			showError('Error: traits did not match up');
		}
	}
	//set tweet data
	$('#tweetID').empty();
    $('#tweetBtn').remove();
        var tweetBtn = $('<a></a>')
        .addClass('twitter-share-button')
        .attr('href', 'http://twitter.com/share')
        .attr('data-url', 'http://WatsonLove.myBluemix.net/')
        .attr('data-text', '@'+twitter1 + ' & @'+twitter2 + ' matched with a love score of '+totalDiff +'. Find out your love score!')
        .attr('data-hashtags', 'IBM, Bluemix, WatsonLoveMatch');
        $('#tweetID').append(tweetBtn);
    twttr.widgets.load();
	//clear previous info
	document.getElementById('totalDiff').innerHTML = 'Total Difference Score: ';
	document.getElementById('bestMatchStat').innerHTML = 'Best Match: ';
	document.getElementById('worstMatchStat').innerHTML = 'Worst Match: ';
	//add the info for the user to see
	document.getElementById('totalDiff').innerHTML += totalDiff;
	document.getElementById('bestMatchStat').innerHTML += bestMatch.id + ' - ' +  twitter1 +': ' + bestMatch.value1 + ', ' + twitter2 + ': ' + bestMatch.value2 + ', Diff: ' + bestMatch.diff;
	document.getElementById('worstMatchStat').innerHTML += worstMatch.id + ' - ' + twitter1 +': ' + worstMatch.value1 + ', ' + twitter2 + ': ' + worstMatch.value2 + ', Diff: ' + worstMatch.diff;
	$("#loader").css('visibility', 'hidden');
	clearTables();
	tableData(modelInfo1,'person1',twitter1);
	tableData(modelInfo2,'person2',twitter2);
}

function difference(a, b){
	return Math.abs(a - b);
}

function tableData(data,person,twitterHandle){
	//remove any previous error messages.
	document.getElementById("errorDiv").innerHTML = '';
	var totalRows = data.traits.length;
	var table = '';
	if(person === 'person1')table = document.getElementById("person1");
	else table = document.getElementById("person2");
	var header = table.insertRow(-1);
	var head1 = header.insertCell();
	var head2 = header.insertCell();
	head1.innerHTML = twitterHandle + "- Trait";
	head2.innerHTML = "Value";
	for(var i = 1; i < totalRows; i++){
		//some kind of bug with Values & Needs traits, Watson does not return a value for them. Do not include them.
		if(data.traits[i].value.length > 0){
			var row = table.insertRow(-1);
			var cell1 = row.insertCell();
			var cell2 = row.insertCell();
			cell1.innerHTML = data.traits[i].id;
			cell2.innerHTML = data.traits[i].value;
		}
		
	}

}

function clearTables()
{
 var tableRef1 = document.getElementById("person1");
 var tableRef2 = document.getElementById("person2");

 while ( tableRef1.rows.length > 0 )
 {
  tableRef1.deleteRow(0);
 }
  while ( tableRef2.rows.length > 0 )
 {
  tableRef2.deleteRow(0);
 }
}

function getTweetText(twitter,callback){
	var tweetBuffer="";
	$.ajax({
	  type: "GET",
	  url: '/tweet',
	  dataType: 'json',
	  data: {
	      handle: twitter
	  },
	success: function(data) {
		for(tweet in data){
			tweetBuffer += data[tweet].text
		}
		callback(tweetBuffer);
	},
	error: function(jqXHR, textstatus, errorThrown) {
		showError('text status ' + textstatus + ', err ' + errorThrown);
	}
		});
}

function getModelingInfo(twitterText,callback){
	var tweetBuffer="";
	$.ajax({
	  type: "POST",
	  url: '/model',
	  dataType: 'json',
	  data: {
	      content: twitterText
	  },
	success: function(data) {
		if(data.error){
			showError(data.error);
		}
		else{
			callback(data);
		}
	},
	error: function(jqXHR, textstatus, errorThrown) {
		showError('text status ' + textstatus + ', err ' + errorThrown);
	}
		});

}

//detect Enter key press on input fields
document.getElementById('twitter1').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      validate();
    }
  }

document.getElementById('twitter2').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      validate();
    }
  }

//Twitter
!function(d,s,id){
	var js,fjs=d.getElementsByTagName(s)[0],
	p=/^http:/.test(d.location)?'http':'https';
	if(!d.getElementById(id)){
		js=d.createElement(s);js.id=id;
		js.src=p+'://platform.twitter.com/widgets.js';
		fjs.parentNode.insertBefore(js,fjs);
	}
}(document, 'script', 'twitter-wjs');

//Facebook
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0";
  fjs.parentNode.insertBefore(js, fjs);
}
(document, 'script', 'facebook-jssdk'));