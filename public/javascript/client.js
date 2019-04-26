function validate(){
	let twitter1 = $("#twitter1").val().trim();
	let twitter2 = $("#twitter2").val().trim();

	if (twitter1 === null || twitter1 === "" || typeof twitter1 === "undefined" ||
		twitter2 === null || twitter2 === "" || typeof twitter2 === "undefined"){
		showError("One or more Twitter handles are blank.");
		return false;
	}

	// Remove "@" if user added it.
	twitter1 = twitter1.charAt(0) === "@" ? twitter1.substring(1) : twitter1;
	twitter2 = twitter2.charAt(0) === "@" ? twitter2.substring(1) : twitter2;

	$("#goButton").attr("disabled", true);
	$("#loader").show();
	getModelFromTweets(twitter1,twitter2);
}

function showError(err){
	document.getElementById("errorView").innerHTML = typeof(err) === "string" ? err : JSON.stringify(err);
	$("#loader").hide();
}

function getModelFromTweets(twitter1,twitter2){
	getTweetText(twitter1, person1Tweets => {
		// Use 50 to weed out undefinedundefined error. It returns a bad string
		if(person1Tweets.length <=50){
			showError(`Could not retrieve tweets for ${twitter1}. Their account may be private.`);
			$("#goButton").attr("disabled", false);
			$("#loader").hide();
			return;
		}
		getModelingInfo(person1Tweets, person1ModelInfo => {
			getTweetText(twitter2, person2Tweets => {
				if(person2Tweets.length <=50){
					showError(`Could not retrieve tweets for ${twitter2}. Their account may be private.`);
					$("#loader").hide();
					return;
				}

				getModelingInfo(person2Tweets, function(person2ModelInfo){
					analyze(twitter1, person1ModelInfo, twitter2,person2ModelInfo);
				});
			});
		});
	});
}

function analyze(twitter1, modelInfo1, twitter2, modelInfo2){
	let totalDiff = 0;
	let bestMatch = {diff: 99999};
	let worstMatch = {diff: 0};

	//TODO data returned also includes personality, needs, and consumption prefs that would be cool to include
	for(let i = 0; i < modelInfo1.values.length; i++){
		// Check we got the same values for each person and get diffs
		if(modelInfo1.values[i].trait_id !== modelInfo2.values[i].trait_id){
			return showError("Error: values did not match up");
		}

		let currTrait1 = modelInfo1.values[i];
		let currTrait2 = modelInfo2.values[i];

		// percentile is expressed as a float, for example, percentile: 0.6109610797287275
		let person1Val = (currTrait1.percentile * 100).toFixed(2);
		let person2Val = (currTrait2.percentile * 100).toFixed(2);

		let diff = Math.abs(person1Val - person2Val);

		if(diff < bestMatch.diff){
			bestMatch = {id: currTrait1.name, person1Val, person2Val, diff};
		}

		if(diff > worstMatch.diff){
			worstMatch = {id: currTrait2.name, person1Val, person2Val, diff};
		}

		totalDiff += diff;
	}

	setTweetButton(twitter1, twitter2, totalDiff);
	let $totalDiff = $("#totalDiff");
	let $bestMatch = $("#bestMatchStat");
	let $worstMatch = $("#worstMatchStat");

	// Clear previous info
	$totalDiff.empty();
	$bestMatch.empty();
	$worstMatch.empty();

	// Add the best and worst match info
	$totalDiff.text(totalDiff);
	$bestMatch.text(`${bestMatch.id} \n ${twitter1}: ${bestMatch.person1Val}% \n ${twitter2}: ${bestMatch.person2Val}%`);
	$worstMatch.text(`${worstMatch.id} \n ${twitter1}: ${worstMatch.person1Val}% \n ${twitter2}: ${worstMatch.person2Val}%`);

	$("#modalTitle").text(`${twitter1} & ${twitter2}`);

	let modalBody = "";
	let rangeIndex = getRangeIndex(totalDiff);

	modalBody += `${ranges[rangeIndex].message}\n check out your difference score, the value tables, and your best and worst scores together below!`;

	$("#modalBody").text(modalBody);
	let popup = new Foundation.Reveal($('#resultModal'));
	popup.open();

	clearTables();
	tableData(modelInfo1,"person1",twitter1);
	tableData(modelInfo2,"person2",twitter2);
	
	$("#loader").hide();
	$("#goButton").attr("disabled", false);
}

function getRangeIndex(totalDiff){
	if(totalDiff < 50){
		return 0;
	}
	else if(totalDiff >= 50 && totalDiff < 100){
		return 1;
	}
	else if (totalDiff >= 100 && totalDiff < 150){
		return 2;
	}
	else if (totalDiff >= 150 && totalDiff < 200){
		return 3;
	}
	else{
		return 4;
	}
}

function setTweetButton(twitter1, twitter2, totalDiff){
	// Set tweet button for sharing to twitter's website
	let $tweetID = $("#tweetID");
	$tweetID.empty();
	$("#tweetBtn").remove();

	let text = encodeURIComponent(`@${twitter1} & @${twitter2} matched with a love score of ${totalDiff}.`);
	const hashtags = encodeURIComponent("IBMCloud,WatsonLoveMatch");
	const url = encodeURI("https://WatsonLove.myBluemix.net");

	let tweetBtn = $("<a></a>")
		.addClass("twitter-share-button")
		.attr("href", `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}&url=${url}`);

	$tweetID.append(tweetBtn);
}

function tableData(data, person, twitterHandle){
	// Remove any previous error messages.
	$("#errorView").empty();

	let totalRows = data.values.length;

	// handling tables with vanilla js is easier
	let table = person === "person1" ? document.getElementById("person1") : document.getElementById("person2");
	let header = table.insertRow(-1);
	let head1 = header.insertCell();
	let head2 = header.insertCell();

	head1.innerText = `Values for ${twitterHandle}`;
	head2.innerText = "Percentage";

	for(let i = 0; i < totalRows; i++){
		let row = table.insertRow(-1);
		let cell1 = row.insertCell();
		let cell2 = row.insertCell();
		cell1.innerText = data.values[i].name;
		cell2.innerText = `${(data.values[i].percentile * 100).toFixed(2)} % `;
	}
}

function clearTables(){
	let tableRef1 = document.getElementById("person1");
	let tableRef2 = document.getElementById("person2");

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
		url: "/tweet",
		dataType: "json",
		data: {
		  handle: twitter
		},
		success: function(data) {
			let tweetBuffer = "";
			data.forEach(tweet => {
				tweetBuffer += `${tweet.text} `;
			});
			callback(tweetBuffer);
		},
		error: function(jqXHR, textstatus, errorThrown) {
			showError(`text status: ${textstatus} - ${errorThrown}`);
			$("#loader").hide();
			$("#goButton").attr("disabled", false);
		}
	});
}

function getModelingInfo(twitterText,callback){
	$.ajax({
		type: "POST",
		url: "/model",
		dataType: "json",
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
			showError(`text status: ${textstatus} - ${errorThrown}`);
			$("#loader").hide();
			$("#goButton").attr("disabled", false);
		}
	});

}

function validateOnEnter(e){
	if (e.key === "Enter"){
		validate();
	}
}

$(function(){
	$(document).foundation();

	$("#goButton").on("click", validate);

	// Detect Enter key press on input fields
	$("#twitter1").on("keyup", validateOnEnter);
	$("#twitter2").on("keyup", validateOnEnter);
});