function validate(){
	var twitter1=document.getElementById("twitter1").value;
	var twitter2=document.getElementById("twitter2").value;
	if (twitter1 == null || twitter1 == "" || twitter1 == undefined || twitter2 == null || 
		twitter2 == "" || twitter2 == undefined){
		showError('One or more Twitter handles are blank.');
		return false;
	}
	else{
		// Remove '@' if user added it.
		if(twitter1.charAt(0) == '@')twitter1 = twitter1.substring(1);
		if(twitter2.charAt(0) == '@')twitter2 = twitter2.substring(1);
		$("#loader").css('visibility', 'visible');
		getModelFromTweets(twitter1,twitter2);
	}
}

function showError(err){
	document.getElementById("errorView").innerHTML = typeof(err) === "string" ? err : JSON.stringify(err);
	$("#loader").css('visibility', 'hidden');
}

function getModelFromTweets(twitter1,twitter2){
	var data1 = "";
	var data2 = "";

	getTweetText(twitter1,function(person1Tweets){
		// Use 50 to weed out undefinedundefined error. It returns a bad string
		if(person1Tweets.length <=50){
			showError('Could not retrieve tweets for ' + twitter1 + ' please make sure their account is not private.');
			$("#loader").css('visibility', 'hidden');
		}
		else{
			getModelingInfo(person1Tweets, function(person1ModelInfo){
				getTweetText(twitter2,function(person2Tweets){
					if(person2Tweets.length <=50){
						showError('Could not retrieve tweets for ' + twitter2 + ' please make sure their account is not private.');
						$("#loader").css('visibility', 'hidden');
					}
					else{
						getModelingInfo(person2Tweets, function(person2ModelInfo){
							analyze(twitter1, person1ModelInfo, twitter2,person2ModelInfo);
						});
					}
				});
			});
		}
	});
}

function analyze(twitter1,modelInfo1,twitter2,modelInfo2){
	// Skip first one, holds no trait
	var currTrait = "";
	var person1Val = 0;
	var person2Val = 0;
	var totalDiff = 0;
	var bestMatch = {id:'',value1:0,value2:0,diff:99999};
	var worstMatch={id:'',value1:0,value2:0,diff:0};
	for(var i = 1; i < modelInfo1.traits.length; i++){
		// Check traits match up
		if(modelInfo1.traits[i].id === modelInfo2.traits[i].id){
			currTrait = modelInfo1.traits[i].id;
			// Remove percent sign from values so we can find the diff
			person1Val = modelInfo1.traits[i].value.slice(0, - 1);
			person2Val = modelInfo2.traits[i].value.slice(0, - 1);
			// Watson returns no value for 2 traits.
			if(person1Val.length > 0 && person2Val.length > 0){
				var diff = Math.abs(person1Val - person2Val);

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
	// Set tweet data
	$('#tweetID').empty();
	$('#tweetBtn').remove();
	var tweetBtn = $('<a></a>')
	.addClass('twitter-share-button')
	.attr('href', 'http://twitter.com/share')
	.attr('data-url', 'https://WatsonLove.myBluemix.net/')
	.attr('data-text', '@'+twitter1 + ' & @'+twitter2 + ' matched with a love score of '+totalDiff +'. Find out your love score with #IBMWatson')
	.attr('data-hashtags', 'IBM, Bluemix, WatsonLoveMatch');
	$('#tweetID').append(tweetBtn);
	twttr.widgets.load();

	// Clear previous info
	document.getElementById('totalDiff').innerHTML = "";
	document.getElementById('bestMatchStat').innerHTML = "";
	document.getElementById('worstMatchStat').innerHTML = "";

	// Add the info for the user to see
	document.getElementById('totalDiff').innerHTML = totalDiff;
	document.getElementById('bestMatchStat').innerHTML = bestMatch.id + '<br/>' +  twitter1 +': ' + bestMatch.value1 + '%<br/>' + twitter2 + ': ' + bestMatch.value2 + '%';
	document.getElementById('worstMatchStat').innerHTML = worstMatch.id + '<br/>' + twitter1 +': ' + worstMatch.value1 + '%<br/>' + twitter2 + ': ' + worstMatch.value2 + '%';
	
	$("#loader").css('visibility', 'hidden');
	
	$('#modalTitle').text(twitter1 + " & " + twitter2);
	var modalBody = "";
	if(totalDiff < 600){
		modalBody = ranges[0].message
	}
	else if(totalDiff >= 600 && totalDiff < 900){
		modalBody = ranges[1].message
	}
	else if (totalDiff >= 900 && totalDiff < 1200){
		modalBody = ranges[2].message
	}
	else if (totalDiff >= 1200 && totalDiff < 1600){
		modalBody = ranges[3].message
	}
	else{
		modalBody = ranges[4].message;
	}
	modalBody += "<br />Check out your difference score, the trait tables, and your best and worst scores together below!";
	$('#modalBody').html(modalBody);
	$('#myModal').foundation('open');

	clearTables();
	tableData(modelInfo1,'person1',twitter1);
	tableData(modelInfo2,'person2',twitter2);
}

function tableData(data, person, twitterHandle){
	// Remove any previous error messages.
	document.getElementById("errorView").innerHTML = '';
	var totalRows = data.traits.length;
	var table = person === 'person1' ? table = document.getElementById("person1") : document.getElementById("person2");
	var header = table.insertRow(-1);
	var head1 = header.insertCell();
	var head2 = header.insertCell();
	head1.innerHTML = "<b>Traits for " + twitterHandle + "</b>";
	head2.innerHTML = "<b>Percentage</b>";
	for(var i = 1; i < totalRows; i++){
		// Skip first row. Watson does not return a value for them.
		if(data.traits[i].value.length > 0){
			var row = table.insertRow(-1);
			var cell1 = row.insertCell();
			var cell2 = row.insertCell();
			cell1.innerHTML = data.traits[i].id;
			cell2.innerHTML = data.traits[i].value;
		}	
	}
}

function clearTables(){
	var tableRef1 = document.getElementById("person1");
	var tableRef2 = document.getElementById("person2");

	while (tableRef1.rows.length > 0 ){
		tableRef1.deleteRow(0);
	}
	while (tableRef2.rows.length > 0 ){
		tableRef2.deleteRow(0);
	}
}

function getTweetText(twitter, callback){
	$.ajax({
		type: "GET",
		url: '/tweet',
		dataType: 'json',
		data: {
		  handle: twitter
		},
		success: function(data) {
			var tweetBuffer = "";
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

// Detect Enter key press on input fields
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

$(function(){
	$('.traitTable').slimScroll({
		height: '275px'
	});
});

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
}(document, 'script', 'facebook-jssdk'));