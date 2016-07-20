
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
  var tumorName = tumorType.name;
  var tumorProperties = tumorType.properties;

  //Add a header
  var tumorFormHTML = '<h1>TUMOR SUMMARY: <span id="tumor-name">' + tumorName + '</span></h1><p>If you would like to answer questions without using the mouse, you can use the tab key to move between questions and to the free text box and either the up/down or left/right arrow keys to change radio button selection.</p><table id="tumor-form">';

  //Add form elements based on tumor properties
  if (tumorProperties!=null){
	  for (i=0; i<tumorProperties.length; i++) {
	  	//Get property information
			var property = tumorProperties[i];
			var propertyName = property.name;
			var propertyDescription = property.description!=null ? ": " + property.description : "";
			var propertyOptions = property.options;

			//Add property title and description to web page
			tumorFormHTML += '<tr><td>' + (i+1) + '. ' + propertyName +  propertyDescription +'</td><td class="form-elements">';

			//Add options for each property
			if (propertyOptions != null) {
				for (j=0; j< propertyOptions.length; j++) {
					//Get option information
					var option = propertyOptions[j];
					var optionName = option.name;
					var optionDescription = option.description!=null ? ": " + option.description : "";
					var optionGroup = option.group;
					if (optionGroup!=null) {
						if (j!=0) {
							tumorFormHTML += "<br><br>";
						}
						//Add option name and description for the group
						tumorFormHTML += '<p>' + optionName + optionDescription + '</p>';
						for (k=0; k< optionGroup.length; k++) {
							//Get the sub otions in the group information
							var subOption = optionGroup[k];
							var subOptionName = subOption.name;
							var subOptionDescription = subOption.description!=null ? ": " + subOption.description : "";
							var inputs = subOption.inputs_required;
							var string_identifier = propertyName + "_" + j + "_" + k;

							//Add radio button for suboption
							if (inputs == null) {
								tumorFormHTML += '<input name ="' + propertyName + '_' + j + '"type="radio" id="' + propertyName + "_" + j + "_" + k + '"><label for="' + propertyName + "_" + j + "_" + k + '">' + subOptionName  + subOptionDescription+'</label><br>';
							}

							//If additional text input is required for suboption, add it
							else {
								var inputs_string = "";
								var count = 0;
								for (l = 0; l< inputs.length; l++) {
									var input = inputs[l];
									if (input != "") {
										input = "(" + input + ")";
									}
									inputs_string+='<input class="' + subOptionName + '"type = "text"/><label>' + input +' </label>';
									count++;
								}
								tumorFormHTML += '<input class="' + subOptionName + '"name="' + propertyName + '_' + j +  '" type="radio" id="' + string_identifier + '"><label for="' + string_identifier + '">' + subOptionName  + subOptionDescription+' </label>' + inputs_string + '<br>';

							}
						}
						//Add Free text option
						tumorFormHTML += '<input name="' + propertyName + '_' + j +  '"type="radio" checked="checked"  required value="-1" id="' + propertyName + j + "_-1"  +'"><label for="' + propertyName +  '_-1' + "_" + k  + '">Free text:</label> <input type="text" name="other" />​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​<br>';
					}
					//Add Free text option for forms with no options.
					else {
						tumorFormHTML += '<input name="' + propertyName + '_' + j +  '"type="radio" checked="checked"  required value="-1" id="' + propertyName + j + "_-1"  +'"><label for="' + propertyName +  '_-1' + "_" + k  + '">Free text:</label> <input type="text" name="other" />​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​<br>';
					}

				}
			}
			tumorFormHTML += '</td></tr>';
	  }
	  //Close table and add generate button and instructions
	  tumorFormHTML += '</table><button id="generate-report-button" class="btn btn-primary" onclick="return generateReport();"">Generate Report</button><p>The text will appear below. Cut and paste into your document.</p><p>To resubmit form, change answers above and re-click button. If you refresh the page, ALL YOUR INPUT WILL DISAPPEAR.</p>';
	}
	//Add message for tumor types that have not been implemented yet.
	else {
		tumorFormHTML += '</table><p>This tumor type is not currently available.</p>'
	}
  //Add html to page
	$('#tumor-type').html(tumorFormHTML);

 
  //Give error message if failure from Firebase.
}, function (errorObject) {
  console.log('The read failed: ' + errorObject.code);
});


//Generate report.
function generateReport() {
	//Add header
	var report = "<table><tr><td>| TUMOR SUMMARY:</td><td>" + $('#tumor-name').html() + "</td></tr>";

	//Loop over properties (rows of table)
	$('#tumor-form > tbody  > tr').each(function() {
		//Grab label, add | character, and remove description (content following :)
		var label = $(':nth-child(1)', this).html();
		if (label.indexOf(':')!=-1){
			label = '|' + label.substr(label.indexOf(' '), label.indexOf(':')-2);
		}
		else {
			label = '|' + label.substr(label.indexOf(' '), label.length+1) + ':';
		}
		var value = "";
		var current = this;

		//Get selected radio buttons for row
		var selected = $(':nth-child(2) > input:radio:checked', this).each(function() {
			//Get radio button information
			var selectedID = $(this).attr( "id");
			var selectedClass = $(this).attr("class");
			var selectedValue = $(this).attr("value");
			var tempValue = "";
			//If radio button is free text add free text value
			if (selectedValue == "-1") {
				tempValue = $(":nth-child(2) > input[name='other']", current).val();
			}
			//Else add radio button text and any additoinal input texts
			else{
				tempValue = $('label[for="' + selectedID + '"]').text();
				if (tempValue.indexOf(':')!=-1) {
					tempValue = tempValue.substr(0, tempValue.indexOf(':'));
				}
				var additionalInputs = "";
				($(":nth-child(2) > input:text[class='" + selectedClass + "']", current)).each(function() {
					additionalInputs += $(this).val() + " ";
				});
				tempValue = tempValue + additionalInputs;

			}
			value += tempValue + " ";
		});
		
		//Add line to report
		report+="<tr><td>" + label + "</td><td>" + value + "</td></tr>";
	});
	//Add report to table.
	report += "</table>";
  $('#generated-report').html(report);
};



