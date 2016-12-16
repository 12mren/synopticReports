// Initializes a session with Syn Rep (Synoptic Reports).
function SynRep() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  //this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button for writing.
  //var buttonTogglingHandler = this.toggleButton.bind(this);
  //this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  //this.messageInput.addEventListener('change', buttonTogglingHandler);

 
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
SynRep.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  //this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Signs-in Syn Rep.
SynRep.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Syn Rep.
SynRep.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
SynRep.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get  user's name from the Firebase user object.
    
    userName = user.displayName;

    //make the current user available globally  using no var
    currentUser = user; 
    
    
    // Set the user's  name.
    this.userName.textContent = userName;


    currentUser = user; 
   
    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
    
    // We load currently existing chant messages.
    this.loadMessages();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
SynRep.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

  // Checks that the Firebase SDK has been correctly setup and configured.
SynRep.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } /*else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }*/
};

window.onload = function() {
  window.SynRep = new SynRep();
};






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

// load the user preferences for current user
  database.ref('/users/'+currentUser.uid).once('value').then(function(snapshot) {
	//Get user preference information
  var current_user_list = snapshot.val();
  //get current user iput choice
  console.log(current_user_list);
  var user_choice = current_user_list.input_choice;

 // load the optioinal lists to match with  current user
  database.ref('/input_choice_list/').once('value').then(function(snapshot) {
	//Get user preference information
  var options_list = snapshot.val();
  
  //get current user iput choice
  var user_choices = options_list[user_choice]; 
 // console.log(user_choice);
 // console.log(options_list);
 // console.log(options_list[user_choice]);

  //Show information if tumor type does not exist
  if (tumorType == null) {
  	$('#no-report').css('display', 'block');
  }
  else {
	  tumorName = tumorType.name;
	  var tumorProperties = tumorType.properties;
	  
	  //Add form elements based on tumor properties
	  if (tumorProperties!=null){
		  tumorFormHTML = generateTumorFormHTML(tumorProperties, user_choices);
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
});
});


//Generate the html for the tumor form
function generateTumorFormHTML(tumorProperties, user_choices) {
	tumorFormHTML = "";

	count = 0;

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
		var propertyOptionalState = property.optional_state;

		//  none as plce holder for now, change to reqwuired or in apprpriate list, will need to get users list first


		if (propertyOptionalState == 'required' || user_choices.indexOf(propertyOptionalState) >=0){
			count +=1;

		//Add property title and description to web page
		tumorFormHTML += '<tr><td>' + (count) + '. <span class="name">' + propertyName +  '</span><span class="description">' +propertyDescription +'</span></td><td class="form-elements">';

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
					var type = "radio";
					if (option.canSelectMultiple) {
						type = "checkbox";
					}
					//Add option name and description for the group
					tumorFormHTML += '<p>' + '<span class="name">' +  optionName + '</span><span class="description">' + optionDescription + '</span></p>';
					tumorFormHTML += '<input onchange="toggleTextBox(this);" name="' + propertyName + '_' + j +  '"type="' + type + '"checked="checked"  value="-2" id="' + propertyName + j + "_-2"  +'"><label for="' + propertyName +  j + '_-2'  + '" class="skip-label">' + skipLabel + '</label><br>';

					for (k=0; k< optionGroup.length; k++) {
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
		var values = getPropertyValue(this);

		//Save location and procedure
		if (label === "| Location:") {
			location = values;
		}

		if (label === "| Procedure:") {
			procedure = values;
		}
		
		//Add line to report
		for (i=0; i< values.length; i++){
			var value = values[i];
			if (!isBiopsy || (label != "| Location:" && label != "| Procedure:")) {
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
	for (i=0; i<location.length; i++) {
		if (i!=0) {
			locationString += ", "
		}
		locationString += location[i];
	}
	for (i=0; i<procedure.length; i++) {
		if (i!=0) {
			procedureString += ", "
		}
		procedureString += procedure[i];
	}
	if (isBiopsy){
		report = "<p>|" +  tumorName + ": " + locationString +", " + procedureString + "</p><table>" + report;
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
		var values = getPropertyValue(this);

		//Save location and procedure
		if (label === "| Location:") {
			location = values;
		}

		if (label === "| Procedure:") {
			procedure = values;
		}
		
		//Add line to report
		for (i=0; i<values.length; i++) {
			var value = values[i];
			if (value!=""){
				if (!isBiopsy || (label != "| Location:" && label != "| Procedure:")) {
					report += generateSpaceReportLine(label, value, isBiopsy, i, values.length);
				}
			}
		}
		
		
	});
	if (isBiopsy) {
		report+= "<p>" + " ".repeat(tabLength) + "||</p>"
	}
	//Add header
	var locationString = "";
	var procedureString = "";
	for (i=0; i<location.length; i++) {
		if (i!=0) {
			locationString += ", "
		}
		locationString += location[i];
	}
	for (i=0; i<procedure.length; i++) {
		if (i!=0) {
			procedureString += ", "
		}
		procedureString += procedure[i];
	}
	if (isBiopsy) {
		report = "<p>| " + tumorName + ": " + locationString +", " + procedureString + "</p>" + report;
	}
	else {
		report = "<p>" + reportHeader + " ".repeat(longestPropertyName + 1 - reportHeader.length) + tumorName + "</p>" + report; 
	}
  $('#generated-report-space').html(report);
};

function generateSpaceReportLine(label, value, isBiopsy, lineNum, numLines){
	if (lineNum!= numLines - 1){
		value += ",";
	}
	var report = "";
	if (isBiopsy) {
		report+="<p>" + " ".repeat(tabLength);
	}
	else {
		report+="<p>";
	}
	if (lineNum == 0){
		report += label + " ".repeat(longestPropertyName + 1 - label.length);
	}
	else {
		report += " ".repeat(longestPropertyName + 1);
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
		var values = getPropertyValue(this);
		
		//Add line to report
		for (j = 0; j< values.length; j++){
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
			}
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


















