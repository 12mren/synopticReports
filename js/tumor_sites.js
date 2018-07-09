var tumorName = "";
var reportHeader = "| TUMOR SUMMARY:";
var longestPropertyName = reportHeader.length;
var longestReportLengthTabs = 72;
var tabLength = 6;
var biopsyType = "";
var skipLabel = "?????YOU SKIPPED THIS!!!!!";
var freeTextLabel = "Free text:";
var tabsToStart = 7;

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
	  var tumorProperties = tumorType.properties;
	  
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
	for (var i=0; i<tumorProperties.length; i++) {
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
			for (var j=0; j< propertyOptions.length; j++) {

				//Get option information
				var option = propertyOptions[j];
				var optionName = option.name;
				var optionDescription = option.description!=null ? " [" + option.description  + "]": "";
				var optionGroup = option.group;
				if (optionGroup!=null) {
					if (j!=0) {
						tumorFormHTML += "<br><br>";
					}
					var type = "radio";
					if (option.canSelectMultiple) {
						type = "checkbox";
					}
					//Add option name and description for the group
					tumorFormHTML += '<p>' + '<span class="name">' +  optionName + '</span><span class="description">' + optionDescription + '</span></p>';
					tumorFormHTML += '<input onchange="toggleTextBox(this);" name="' + propertyName + '_' + j +  '"type="' + type + '"checked="checked"  value="-2" id="' + propertyName + j + "_-2"  +'"><label for="' + propertyName +  j + '_-2'  + '" class="skip-label">' + skipLabel + '</label><br>';

					for (var k=0; k< optionGroup.length; k++) {
						//Get the sub otions in the group information
						var subOption = optionGroup[k];
						var subOptionName = subOption.name;
						var subOptionDescription = subOption.description!=null ? " [" + subOption.description + "]": "";
						var inputs = subOption.inputs_required;
						var string_identifier = propertyName + "_" + j + "_" + k;

						//Add radio button for suboption
						if (inputs == null) {
							tumorFormHTML += '<input onchange="toggleTextBox(this);" class="' + subOptionName + '" name ="' + propertyName + '_' + j + '"type="' + type + '" id="' + propertyName + "_" + j + "_" + k + '"><label for="' + propertyName + "_" + j + "_" + k + '"><span class="name">' + subOptionName  + '</span><span class="description">' + subOptionDescription+'</span></label><br>';
						}

						//If additional text input is required for suboption, add it
						else {
							var inputs_string = "";
							var count = 0;
							for (var l = 0; l< inputs.length; l++) {
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
							tumorFormHTML += '<input onchange="toggleTextBox(this);" class="' + subOptionName + '"name="' + propertyName + '_' + j +  '"type="' + type + '" id="' + string_identifier + '"><label for="' + string_identifier + '"><span class="name">' + subOptionName  + '</span><span class="description">' + subOptionDescription+'</span></label>' + inputs_string + '<br>';

						}
					}
					//Add Free text option
					tumorFormHTML += '<input class="other" onchange="toggleTextBox(this);" name="' + propertyName + '_' + j +  '"type="' + type + '"   required value="-1" id="' + propertyName + j + "_-1"  +'"><label for="' + propertyName + j+ '_-1' + "_"  + '">' + freeTextLabel + '</label> <input name="' + propertyName + '_' + j + '" class="other" disabled type="text"  />​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​<br>';
				}
				//Add Free text option for forms with no options.
				else {
					tumorFormHTML += '<input onchange="toggleTextBox(this);" name="' + propertyName + '_' + j +  '"type="' + type + '" checked="checked"  value="-2" id="' + propertyName + j + "_-2"  +'"><label for="' + propertyName +  j + '_-2'  + '" class="skip-label">' + skipLabel +'</label><br>';
					tumorFormHTML += '<input class="other" onchange="toggleTextBox(this);" name="' + propertyName + '_' + j +  '"type="' + type + '"   required value="-1" id="' + propertyName + j + "_-1"  +'"><label for="' + propertyName +  j+'_-1' + "_"  + '">' + freeTextLabel + '</label> <input disabled type="text" class="other" name="' + propertyName + '_' + j +'"/>​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​<br>';
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
	var part = "";
    var diagnosisType = "";
	//Loop over properties (rows of table)
	$('#tumor-form > tbody  > tr').each(function() {
		//Grab label, add | character, and remove description (content following :)
		var label = getPropertyLabel(this);
		var values = getPropertyValue(this);

		//Save location and procedure
		if (label === "| Location:") {
			location = values;
		}

		if (label === "| Procedure:") {
			procedure = values;
		}

		if (label === "| Part:") {
            part = values;
        }


		if (label === "| Diagnosis/Type:") {
                diagnosisType = values;
        }
		
		//Add line to report
		for (var i=0; i< values.length; i++){
			var value = values[i];
			if (!isBiopsy || (label != "| Part:" && label != "| Location:" && label != "| Procedure:" && label != "| Diagnosis/Type:")) {
				//Add line to report
				if (value!="") {
					if (i!=values.length-1) {
						value = value + ",";
					}
					if (isBiopsy) {
						if (i==0){
							report+="<tr><td class='report-indent'></td><td class='report-label'>" + label + "</td><td>" + value + "</td></tr>";
						}
						else {
							report+="<tr><td class='report-indent'></td><td class='report-label'></td><td>" + value + "</td></tr>";
						}
					}
					else {
						if (i==0){
							report+="<tr><td class='report-label'>" + label + "</td><td>" + value + "</td></tr>";
						}
						else {
							report+="<tr><td class='report-label'></td><td>" + value + "</td></tr>";
						}
						
					}
				}
			}		
		}
		
	});

	if (isBiopsy) {
		report += "<tr><td class='report-indent'></td><td class='report-label'>||</td><td></td></tr>";
	}
	report += "</table>";

	//Add header
	var locationString = "";
	var procedureString = "";
	var partString = "";
	var diagnosisTypeString = "";
	for (var i=0; i<location.length; i++) {
		if (i!=0) {
			locationString += ", "
		}
		locationString += location[i];
	}
	for (var i=0; i<procedure.length; i++) {
		if (i!=0) {
			procedureString += ", "
		}
		procedureString += procedure[i];
	}
	for (var i=0; i<part.length; i++) {
        if (i!=0) {
            partString += ", "
        }
        partString += part[i];
    }


    for (var i=0; i<diagnosisType.length; i++) {
        if (i!=0) {
            diagnosisTypeString += ", "
        }
    	diagnosisTypeString += diagnosisType[i];
    }
	if (isBiopsy){
		var strippedTumorName = tumorName.replace(" biopsy", "");
		report = "<p>|" + partString + " " + strippedTumorName + ", " + locationString +", " + procedureString + ":"+ "</p><table><tr><td class='report-indent'></td><td class='report-label'>" + diagnosisTypeString + "</td><td></td></tr></table><table>" + report;
	}
	else {
	    report = "<table><tr><td>| TUMOR SUMMARY:</td><td>" + tumorName + "</td></tr>" + report;
	}

	//Add report to table.
  $('#generated-report').html(report);
};


//Generate report with spaces.
function generateReportSpace(isBiopsy) {
	generateWhiteSpaceReport(isBiopsy, /*useTabs=*/false)

};

//Generate report with tabs.
function generateReportTabbed(isBiopsy) {
	generateWhiteSpaceReport(isBiopsy, /*useTabs=*/true)
};

function generateWhiteSpaceReport(isBiopsy, useTabs) {
	var location = "";
	var procedure = "";
	var report = "";
	var part = "";
    var diagnosisType = "";
	
	//Loop over properties (rows of table)
	$('#tumor-form > tbody  > tr').each(function() {
		var label = getPropertyLabel(this);
		var values = getPropertyValue(this);

		//Save location and procedure
		if (label === "| Location:") {
			location = values;
		}

		if (label === "| Procedure:") {
			procedure = values;
		}

		if (label === "| Part:") {
            part = values;
        }


        if (label === "| Diagnosis/Type:") {
            diagnosisType = values;
        }
		
		//Add line to report
		for (var i=0; i<values.length; i++) {
			var value = values[i];
			if (value!=""){
				if (!isBiopsy || (label != "| Part:" && label != "| Location:" && label != "| Procedure:" && label != "| Diagnosis/Type:")) {
					report += generateWhiteSpaceReportLine(label, value, isBiopsy, i, values.length, useTabs);
				}
			}
		}
	});
	if (isBiopsy) {
		if (useTabs) {
			report+= "<p>\t||</p>"
		} else {
			report+= "<p>" + " ".repeat(tabLength) + "||</p>"
		}
		
	}
	//Add header
	var locationString = "";
	var procedureString = "";
	var partString = "";
	var diagnosisTypeString = "";

	for (var i=0; i<location.length; i++) {
		if (i!=0) {
			locationString += ", "
		}
		locationString += location[i];
	}
	for (var i=0; i<procedure.length; i++) {
		if (i!=0) {
			procedureString += ", "
		}
		procedureString += procedure[i];
	}

	for (var i=0; i<part.length; i++) {
        if (i!=0) {
                partString += ", "
        }
        partString += part[i];
    }


    for (var i=0; i<diagnosisType.length; i++) {
        if (i!=0) {
                diagnosisTypeString += ", "
        }
    	diagnosisTypeString += diagnosisType[i];
    }
	if (isBiopsy) {
	    var strippedTumorName = tumorName.replace(" biopsy", "");
	    if (useTabs){
			report = "<p>|" + partString + " " + strippedTumorName + ", " + locationString +", " + procedureString + ":"+ "</p><p>\t" + diagnosisTypeString + "</p>" + report;
	    } else {
	    	report = "<p>|" + partString + " " + strippedTumorName + ", " + locationString +", " + procedureString + ":"+ "</p><p>" + " ".repeat(tabLength) + diagnosisTypeString + "</p>" + report;
	    }
	}
	else {
		if (useTabs) {
			report = "<p>" + reportHeader + "\t".repeat(tabsToStart - Math.floor(reportHeader.length/tabLength)) + tumorName + "</p>" + report; 
		} else {
			report = "<p>" + reportHeader + " ".repeat(longestPropertyName + 1 - reportHeader.length) + tumorName + "</p>" + report; 
		}
		
	}
	if (useTabs) {
		$('#generated-report-tabbed').html(report);
	} else {
		$('#generated-report-space').html(report);
	}
}

function generateWhiteSpaceReportLine(label, value, isBiopsy, lineNum, numLines, useTabs){
	if (lineNum!= numLines - 1){
		value += ",";
	}
	var report = "";
	if (isBiopsy) {
		if (useTabs) {
			report+="<p>\t";
		}
		else {
			report+="<p>" + " ".repeat(tabLength);
		}
	}
	else {
		report+="<p>";
	}
	if (lineNum == 0){
		if (useTabs) {
			if (label.length < (tabsToStart - 1) * tabLength) {
				report += label + "\t".repeat(tabsToStart - Math.floor(label.length/tabLength));
			} else {
				var spaceIndex = (tabsToStart - 1) * tabLength - 1;
				while (spaceIndex > 0) {
					if (label[spaceIndex] == " ") {
						break;
					}
					spaceIndex -= 1;
				}
				startLabel = label.substring(0, spaceIndex);
				endLabel = label.substring(spaceIndex);
				report += startLabel + "</p>";
				report += "<p>\t" + endLabel + "\t".repeat(tabsToStart - 1 - Math.floor(endLabel.length/tabLength));
			}
		}
		else {
			report += label + " ".repeat(longestPropertyName + 1 - label.length);
		}
	}
	else {
		if (useTabs) {
			report += "\t".repeat(tabsToStart);
		}
		else {
			report += " ".repeat(longestPropertyName + 1);
		}
	}
	if (value.length <= longestReportLengthTabs - longestPropertyName - 1) {
		report += value + "</p>";
	}
	else {
		var factor = useTabs ? tabsToStart * tabLength : longestPropertyName - 1;
		while (value.length > longestReportLengthTabs - factor) {
			var foundSpace = false;
			var index = longestReportLengthTabs - factor;
			for (var i = index; i>=0; i--) {
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
				if (useTabs) {
					report += "<p>" + "\t".repeat(tabsToStart + 1);
				}
				else {
					report += "<p>" + " ".repeat(longestPropertyName + 1 + tabLength);
				}
			}	
			else {
				if (useTabs) {
					report += "<p>" + "\t".repeat(tabsToStart);
				} 
				else {
					report += "<p>" + " ".repeat(longestPropertyName + 1);
				}
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
		var values = getPropertyValue(this);
		
		//Add line to report
		for (var j = 0; j< values.length; j++){
			var value = values[j];
			if (j!= values.length-1){
				value += ",";
			}
			if (value!=""){
				if (j==0){
					report+="<p>" + label + "</p><p>" + " ".repeat(tabLength);
				}
				else {
					report+="<p>" + " ".repeat(tabLength);
				}
				if (value.length <= longestReportLengthTabs-tabLength) {
					report += value + "</p>";
				}
				else {
					while (value.length > longestReportLengthTabs-tabLength) {
						var foundSpace = false;
						var index = longestReportLengthTabs-tabLength - 1;
						for (var i = index; i>=0; i--) {
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
			}
		}
		
		

	});
  $('#generated-report-two-line').html(report);
};

//Get the label of a property in the tumor form (ex/ "| Procedure:"" )
function getPropertyLabel(tableRow) {
	//Grab label, add | character, and remove description (content following :)
	var label = $(':nth-child(1) > span[class="name"]', tableRow).text();
	label = '| ' + label + ":";
	return label;
}

//Get the value inputed by the user for a select question
function getPropertyValue(tableRow) {
	var values = [];
	var value = "";

	//Get selected radio buttons/check boxes for row
	var buttonGroup = 0;
	var previousButtonGroup = "";
	var countButtons = 0;
	var selected = $(':nth-child(2) > input:checked', tableRow).each(function() {
		//Get radio button/check box information
		var selectedID = $(this).attr( "id");
		var selectedClass = $(this).attr("class");
		var selectedValue = $(this).attr("value");
		var selectedName = $(this).attr("name");
		var tempValue = "";
		if (previousButtonGroup !== selectedName && countButtons!=0) {
			buttonGroup ++;
		}
		if (countButtons!=0 && previousButtonGroup === selectedName) {
			values.push(value.trim());
			value = "";
		}
		else if (countButtons!=0) {
			value += " ";
		}
		//If radio button/checkbox is free text add free text value
		if (selectedValue == "-1") {
			var input = $(":nth-child(2) > input[type='text'][class='other']", tableRow).get(buttonGroup);
			tempValue = $(input).val().trim();
		}
		else if (selectedValue == "-2") {
			tempValue = $('label[for="' + selectedID + '"]').text().trim();
		}
		//Else add radio button/checkbox text and any additoinal input texts
		else{
			tempValue = $('label[for="' + selectedID + '"]').text().trim();
			if (tempValue.indexOf('[')!=-1) {
				tempValue = tempValue.substring(0, tempValue.indexOf('[')).trim();
			}
			var count = 0;
			var additionalInputs = "";
			($(":nth-child(2) > [class='" + selectedClass + "']", tableRow)).each(function() {
				if ($(this).attr('type') !== 'radio' && $(this).attr('type')!== 'checkbox') {
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
		value += tempValue;
		
		previousButtonGroup = selectedName;
		countButtons ++;

	});
	values.push(value.trim());
	return values;
}

//Disable/enable text options on radio button/checkbox change
function toggleTextBox(buttonOrBox) {
  var itemName = $(buttonOrBox).attr('name');
  var itemValue = $(buttonOrBox).attr('value');
  var validSelection = false;
  
  $('input[type=text][name="' + itemName + '"], select[name="' + itemName + '"]').each(function() {
  	var textClass = $(this).attr('class');
  	var assosciatedCheckOrRadio = $('input[type=radio][name="' + itemName + '"][class="' + textClass + '"], input[type=checkbox][name="' + itemName + '"][class="' + textClass + '"]').first();
  	if ($(assosciatedCheckOrRadio).is(':checked')) {
  		$(this).prop('disabled', false);
  	}
  	else {
  		$(this).prop('disabled', true);
  	}

  });

  $('input[type=checkbox][name="' + itemName + '"]').each(function() {
  	if ($(this).is(':checked') && $(this).attr('value')!=-2){
  		validSelection = true;
  		return false;
  	}
  });

  if (validSelection && itemValue!=-2) {
  	$('input[type=checkbox][name="' + itemName + '"][value=-2]').first().attr('checked', false);
  }

  
}

