var tumorProperties = {};
var tumorName = "";
var reportHeader = "| TUMOR SUMMARY:";
var longestPropertyName = reportHeader.length;
var longestReportLengthTabs = 80;
var tabLength = 5;
var biopsyType = "";
var skipLabel = "?????YOU SKIPPED THIS!!!!!";
var freeTextLabel = "Free text:";

//Get the parameters passed into the URL
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
	var pair = vars[i].split("=");
		// If first entry with this name
	if (typeof query_string[pair[0]] === "undefined") {
	  query_string[pair[0]] = decodeURIComponent(pair[1]);
		// If second entry with this name
	} else if (typeof query_string[pair[0]] === "string") {
	  var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
	  query_string[pair[0]] = arr;
		// If third or later entry with this name
	} else {
	  query_string[pair[0]].push(decodeURIComponent(pair[1]));
	}
  } 
  return query_string;
}();


// Initialize Firebase
  var config = {
    apiKey: "AIzaSyDeu5ZKrz9HqtXkJk5ibHrsJhoP-MBezXM",
    authDomain: "synopticreports.firebaseapp.com",
    databaseURL: "https://synopticreports.firebaseio.com",
    storageBucket: "",
  };

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

//Load the form for this tumor type
database.ref('/tumor_types/' + QueryString.id).once('value').then(function(snapshot) {
	//Get tumorType information
  var tumorType = snapshot.val();
  //Show information if tumor type does not exist
  if (tumorType == null) {
  	$('#no-report').css('display', 'block');
  }
  else {
	  tumorName = tumorType.name;
	  tumorProperties = tumorType.properties;
	  
	  //Add form elements based on tumor properties
	  if (tumorProperties!=null){
		  tumorFormHTML = generateTumorFormHTML(tumorProperties);
		  //Show tumor form
		  $('#header').css('display', 'block');
		  $('#tumor-type').css('display', 'block');
		  if (tumorType.biopsy_type !=null) {
		  	biopsyType = tumorType.biopsy_type;
		  	$('#biopsy-button').css('display', 'block');
		  }
		  //Add name
		  if (tumorType.biopsy_type !=null) {
		  	$('#tumor-name').html(tumorName + " [" + biopsyType + "]");
		  }
	  	else {
	  		$('#tumor-name').html(tumorName);
	  	}
		  //Add html to page
			$('#tumor-form').html(tumorFormHTML);
		}
		//Add message for tumor types that have not been implemented yet.
		else {
			$('#header').css('display', 'block');
			$('#no-report').css('display', 'block')
		}
	}
  //Give error message if failure from Firebase.
}, function (errorObject) {
  console.log('The read failed: ' + errorObject.code);
});


//Generate the html for the tumor form
function generateTumorFormHTML(tumorProperties) {
	tumorFormHTML = "";
	for (i=0; i<tumorProperties.length; i++) {
  	//Get property information
		var property = tumorProperties[i];
		var propertyName = property.name;

		//3 for '|', ' ', and ':' characters added to property name in report output
		if (propertyName.length + 3 > longestPropertyName) {
			longestPropertyName = propertyName.length + 3;
		}
		var propertyDescription = property.description!=null ? " [" + property.description + "]" : "";
		var propertyOptions = property.options;

		//Add property title and description to web page
		tumorFormHTML += '<tr><td>' + (i+1) + '. <span class="name">' + propertyName +  '</span><span class="description">' +propertyDescription +'</span></td><td class="form-elements">';

		//Add options for each property
		if (propertyOptions != null) {
			for (j=0; j< propertyOptions.length; j++) {

				//Get option information
				var option = propertyOptions[j];
				var optionName = option.name;
				var optionDescription = option.description!=null ? " [" + option.description  + "]": "";
				var optionGroup = option.group;
				if (optionGroup!=null) {
					if (j!=0) {
						tumorFormHTML += "<br><br>";
					}
					//Add option name and description for the group
					tumorFormHTML += '<p>' + '<span class="name">' +  optionName + '</span><span class="description">' + optionDescription + '</span></p>';
					tumorFormHTML += '<input onchange="changeRadioButton(this);" name="' + propertyName + '_' + j +  '"type="radio" checked="checked"  value="-2" id="' + propertyName + j + "_-2"  +'"><label for="' + propertyName +  j + '_-2'  + '" class="skip-label">' + skipLabel + '</label><br>';

					for (k=0; k< optionGroup.length; k++) {
						//Get the sub otions in the group information
						var subOption = optionGroup[k];
						var subOptionName = subOption.name;
						var subOptionDescription = subOption.description!=null ? " [" + subOption.description + "]": "";
						var inputs = subOption.inputs_required;
						var string_identifier = propertyName + "_" + j + "_" + k;

						//Add radio button for suboption
						if (inputs == null) {
							tumorFormHTML += '<input onchange="changeRadioButton(this);" class="' + subOptionName + '" name ="' + propertyName + '_' + j + '"type="radio" id="' + propertyName + "_" + j + "_" + k + '"><label for="' + propertyName + "_" + j + "_" + k + '"><span class="name">' + subOptionName  + '</span><span class="description">' + subOptionDescription+'</span></label><br>';
						}

						//If additional text input is required for suboption, add it
						else {
							var inputs_string = "";
							var count = 0;
							for (l = 0; l< inputs.length; l++) {
								var input = inputs[l];
								if (typeof(input) === "string") {
									inputs_string+='<input id="' + string_identifier + "_" + l + '"name="' + propertyName + '_' + j + '"class="' + subOptionName + '"type = "text" disabled/><label for="' + string_identifier + "_" + l + '">' + input +' </label>';
								}
								else {
									inputs_string += '<select disabled name="' + propertyName + '_' + j + '"class="' + subOptionName + '">';
									for (m=0; m<input.length; m++){
										inputs_string += "<option value='" + input[m] + "'>" + input[m] + "</option>";
									}
									inputs_string += "</select>";
								}
								count++;
							}
							tumorFormHTML += '<input onchange="changeRadioButton(this);" class="' + subOptionName + '"name="' + propertyName + '_' + j +  '" type="radio" id="' + string_identifier + '"><label for="' + string_identifier + '"><span class="name">' + subOptionName  + '</span><span class="description">' + subOptionDescription+'</span></label>' + inputs_string + '<br>';

						}
					}
					//Add Free text option
					tumorFormHTML += '<input class="other" onchange="changeRadioButton(this);" name="' + propertyName + '_' + j +  '"type="radio"   required value="-1" id="' + propertyName + j + "_-1"  +'"><label for="' + propertyName + j+ '_-1' + "_"  + '">' + freeTextLabel + '</label> <input name="' + propertyName + '_' + j + '" class="other" disabled type="text"  />​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​<br>';
				}
				//Add Free text option for forms with no options.
				else {
					tumorFormHTML += '<input onchange="changeRadioButton(this);" name="' + propertyName + '_' + j +  '"type="radio" checked="checked"  value="-2" id="' + propertyName + j + "_-2"  +'"><label for="' + propertyName +  j + '_-2'  + '" class="skip-label">' + skipLabel +'</label><br>';
					tumorFormHTML += '<input class="other" onchange="changeRadioButton(this);" name="' + propertyName + '_' + j +  '"type="radio"   required value="-1" id="' + propertyName + j + "_-1"  +'"><label for="' + propertyName +  j+'_-1' + "_"  + '">' + freeTextLabel + '</label> <input disabled type="text" class="other" name="' + propertyName + '_' + j +'"/>​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​<br>';
				}

			}
		}
		tumorFormHTML += '</td></tr>';
	}
		return tumorFormHTML;

}


//Generate report.
function generateReport(isBiopsy) {
	var report = "";
	var location = "";
	var procedure = "";
	//Loop over properties (rows of table)
	$('#tumor-form > tbody  > tr').each(function() {
		//Grab label, add | character, and remove description (content following :)
		var label = getPropertyLabel(this);
		var value = getPropertyValue(this);

		//Save location and procedure
		if (label === "| Location:") {
			location = value;
		}

		if (label === "| Procedure:") {
			procedure = value;
		}
		
		//Add line to report
		if (!isBiopsy || (label != "| Location:" && label != "| Procedure:")) {
			//Add line to report
			if (isBiopsy) {
				report+="<tr><td class='report-indent'></td><td class='report-label'>" + label + "</td><td>" + value + "</td></tr>";
			}
			else {
				report+="<tr><td class='report-label'>" + label + "</td><td>" + value + "</td></tr>";
			}
		}		
	});

	if (isBiopsy) {
		report += "<tr><td class='report-indent'></td><td class='report-label'>||</td><td></td></tr>";
	}
	report += "</table>";

	//Add header
	if (isBiopsy){
		report = "<p>" +  tumorName + ": " + location +", " + procedure + "</p><table>" + report;
	}
	else {
		report = "<table><tr><td>| TUMOR SUMMARY:</td><td>" + tumorName + "</td></tr>" + report;
	}

	//Add report to table.
  $('#generated-report').html(report);
};


//Generate report with spaces.
function generateReportSpace(isBiopsy) {
	var location = "";
	var procedure = "";
	var report = "";
	
	//Loop over properties (rows of table)
	$('#tumor-form > tbody  > tr').each(function() {
		var label = getPropertyLabel(this);
		var value = getPropertyValue(this);

		//Save location and procedure
		if (label === "| Location:") {
			location = value;
		}

		if (label === "| Procedure:") {
			procedure = value;
		}
		
		//Add line to report
		if (!isBiopsy || (label != "| Location:" && label != "| Procedure:")) {
			report += generateSpaceReportLine(label, value, isBiopsy);
		}
		
	});
	if (isBiopsy) {
		report+= "<p>" + " ".repeat(tabLength) + "||</p>"
	}
	//Add header
	if (isBiopsy) {
		report = "<p>| " + tumorName + ": " + location +", " + procedure + "</p>" + report;
	}
	else {
		report = "<p>" + reportHeader + " ".repeat(longestPropertyName + 1 - reportHeader.length) + tumorName + "</p>" + report; 
	}
  $('#generated-report-space').html(report);
};

function generateSpaceReportLine(label, value, isBiopsy){
	var report = "";
	if (isBiopsy) {
		report+="<p>" + " ".repeat(tabLength) + label + " ".repeat(longestPropertyName + 1 - label.length);
	}
	else {
		report+="<p>" + label + " ".repeat(longestPropertyName + 1 - label.length);
	}
	if (value.length <= longestReportLengthTabs - longestPropertyName - 1) {
		report += value + "</p>";
	}
	else {
		while (value.length > longestReportLengthTabs - longestPropertyName - 1) {
			var foundSpace = false;
			var index = longestReportLengthTabs - longestPropertyName - 1;
			for (i = index; i>=0; i--) {
				if (value[i] == " ") {
					index = i;
					foundSpace = true;
					break;
				}
			}
			if (!foundSpace) {
				report += value.substring(0, index) + "-</p>";
				value = value.substring(index-1 , value.length);
			}
			else {
				report += value.substring(0, index) + " </p>";
				value = value.substring(index +1, value.length);
			}
			if (isBiopsy){
				report += "<p>" + " ".repeat(longestPropertyName + 1 + tabLength);
			}	
			else {
				report += "<p>" + " ".repeat(longestPropertyName + 1);
			}
			
		}
		report += value + "</p>";

	}
	return report;
}

//Generate report with two lines.
function generateReportTwoLines() {
//Add header
	var report = "<p>" + reportHeader + "</p><p>" + " ".repeat(tabLength) + tumorName + "</p>"; 

	//Loop over properties (rows of table)
	$('#tumor-form > tbody  > tr').each(function() {
		var label = getPropertyLabel(this);
		var value = getPropertyValue(this);
		
		//Add line to report
		report+="<p>" + label + "</p><p>" + " ".repeat(tabLength);
		if (value.length <= longestReportLengthTabs-tabLength) {
			report += value + "</p>";
		}
		else {
			while (value.length > longestReportLengthTabs-tabLength) {
				var foundSpace = false;
				var index = longestReportLengthTabs-tabLength - 1;
				for (i = index; i>=0; i--) {
					if (value[i] == " ") {
						index = i;
						foundSpace = true;
						break;
					}
				}
				if (!foundSpace) {
					report += value.substring(0, index) + "-</p>";
					value = value.substring(index-1 , value.length);
				}
				else {
					report += value.substring(0, index) + " </p>";
					value = value.substring(index +1, value.length);
				}
				report += "<p>" + " ".repeat(tabLength);
			}
			report += value + "</p>";	
		}
		

	});
  $('#generated-report-two-line').html(report);
};

//Get the label of a property in the tumor form (ex/ "| Procedure:"" )
function getPropertyLabel(tableRow) {
	//Grab label, add | character, and remove description (content following :)
	var label = $(':nth-child(1) > span[class="name"]', tableRow).html();
	label = '| ' + label + ":";
	return label;
}

//Get the value inputed by the user for a select question
function getPropertyValue(tableRow) {
	var value = "";

	//Get selected radio buttons for row
	var radioButtonGroup = 0;
	var selected = $(':nth-child(2) > input:radio:checked', tableRow).each(function() {
		//Get radio button information
		var selectedID = $(this).attr( "id");
		var selectedClass = $(this).attr("class");
		var selectedValue = $(this).attr("value");
		var tempValue = "";
		//If radio button is free text add free text value
		if (selectedValue == "-1") {
			var input = $(":nth-child(2) > input[type='text'][class='other']", tableRow).get(radioButtonGroup);
			tempValue = $(input).val().trim();
		}
		else if (selectedValue == "-2") {
			tempValue = $('label[for="' + selectedID + '"]').text().trim();
		}
		//Else add radio button text and any additoinal input texts
		else{
			tempValue = $('label[for="' + selectedID + '"]').text().trim();
			if (tempValue.indexOf('[')!=-1) {
				tempValue = tempValue.substring(0, tempValue.indexOf('[')).trim();
			}
			var count = 0;
			var additionalInputs = "";
			($(":nth-child(2) > [class='" + selectedClass + "']", tableRow)).each(function() {
				if ($(this).attr('type') !== 'radio') {
					var addedComma = false;
					var additionalInput = $(this).val().trim();
					if (additionalInput.replace(/ /g, '') != "") {
						if (count!=0 || tempValue.replace(/ /g,'') != "" ){
							additionalInputs += ", "
							addedComma = true;
						}
						additionalInputs += additionalInput;
						count ++;
					}
					if ($(this).attr('type') === 'text') {
						var labelId = $(this).attr("id");
						var labelText = $("label[for='" + labelId + "']").text().trim();
						if (labelText != "" && !addedComma) {
							additionalInputs += ", " + labelText;
							addedComma = true;
						}
						else {
							additionalInputs += "" + labelText;
						}
					}
				}
			});
			tempValue = tempValue + additionalInputs;

		}
		value += tempValue + " ";
		radioButtonGroup ++;
	});
	return value.trim();
}

//Disable/enable text options on radio button change
function changeRadioButton(radioButton) {
  var itemClass = $(radioButton).attr('class');
  var itemName = $(radioButton).attr('name');
  $('input[type=text][name="' + itemName + '"], select[name="' + itemName + '"]').each(function() {
  	var textClass = $(this).attr('class');
  	if (textClass === itemClass) {
  		$(this).prop('disabled', false);
  	}
  	else {
  		$(this).prop('disabled', true);
  	}
  })
  
}

