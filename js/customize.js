// Initializes a session with Syn Rep (Synoptic Reports) for logging in and display on nacbar.
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
    var userName = user.displayName;
    currentUser = user; 
    this.userName.textContent = userName;
   
    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
  
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
   
    // We load currently existing chant messages.
    //this.loadMessages();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    //this.userPic.setAttribute('hidden', 'true');
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


  //function to write the new output choice to the database
 function writeUserData(uId, username, d_input, d_output) {
      firebase.database().ref('/users/' + uId).set({
        username: username,
        input_choice: d_input,
        output_choice : d_output
       
    });
   }






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



//get the users current input choice and display it
database.ref('/users/').once('value').then(function(snapshot) {
  //Get get current choice and display it, make variable global for later writing function
  var users = snapshot.val();
  current_choice = users[currentUser.uid].input_choice; 
  document.getElementById("current").textContent =  current_choice;

  // get global user info for updating
  currentUserId = currentUser.uid;
  currentUserName = users[currentUser.uid].name;
  currentUserOutputChoice = users[currentUser.uid].output_choice;
});




//Get the list of input choices and display it
database.ref('/input_choice_list/').once('value').then(function(snapshot) {
  //Get the input choice list
  var input_choice_list = snapshot.val();
  //fill in the HTML with a radio list
  tumorFormHTML = generateTumorFormHTML(input_choice_list);
  // foramt new HTML
      $('#tumor-type').css('display', 'block');
      $('#tumor-form').html(tumorFormHTML);
  //Give error message if failure from Firebase.
}, function (errorObject) {
  console.log('The read failed: ' + errorObject.code);
});


//Fucntion to see what the user chose and to change both the database and the current choice on the website
function change_input(){
  //get the users choice from the radio buttons
  var k = $("input[name=rate]:checked").val();
  
  //put in html format
  var h ='<p>'+k+'</p>'
  
  //update webpage
  $('#current').html(h);

  //update database with new choice with the writeUserData function
  
  writeUserData(currentUserId, currentUserName, k, currentUserOutputChoice);
};


 


//Generate the html for the the radio list of input choices
function generateTumorFormHTML(input_choice_list) {
  var type = "radio";

  //start the HTML
  tumorFormHTML = '<div class="row"></div><div class="col-md-12"><strong>Options</strong></div><div id = "rates">';
  
  //loop through each choice and add each choice to the list
  for (i in input_choice_list) {
    
    //format the id for each different choice           
    var id3 = "change_input_"+i;
  
    //add each choice
    tumorFormHTML +='<input type="radio" id="r'+i+'" name="rate" value="'+i+'">'+ i+'<br>'
  };
  // add the last div to the html
  tumorFormHTML += '</div>';  
  return tumorFormHTML;
  };


// List all the sites so we can take them to the optional only page

// Get a reference to the database service
var database = firebase.database();

//Load table of tumor types
database.ref('/tumor_types/').once('value').then(function(snapshot) {
  //Get tumor types
  var tumorTypes = snapshot.val();
  var tumorTypeGridHTML = {};
  var otherHTML = '<div class="row"><div class="col-md-12"><strong>Other</strong>';
  var mostCommonHTML = '<div class="row"><div class="col-md-12"><strong>Most Common</strong>';
  var letterCount = 0;
  var previousLetter = ''
  var isOther = false;
  var organTypes = [];
  //Add tumor types to most common table and alphabetical table
  for (i=0; i<tumorTypes.length; i++) {
    var tumorType = tumorTypes[i];
    var tumorName = tumorType.name;
    var tumorProperties = tumorType.properties;
    var optional = tumorType.optional;
    var tumorDisplayName = tumorName;
    if (tumorType.biopsy_type!=null) {
      tumorDisplayName += " [" + tumorType.biopsy_type + "]";
    }
    if (optional) {
      tumorDisplayName += " (optional)";
    }
    var organGroup = tumorType.organ_group;

    //Add coming soon remark to unimplemented tumor types
    if (tumorProperties == null) {
        tumorDisplayName += " (Coming Soon)"
    }
    //If is a most common tumor type, add to most common
    if (tumorType.most_common) {
        mostCommonHTML += '<div class="row"><div class="col-md-12"><a href="tumor_sites_optional_questions.html?id='+i+'">' + tumorDisplayName + '</a></div></div>';
    }
    if (organGroup == null) {
      isOther = true;
      otherHTML += '<div class="row"><div class="col-md-12"><a href="tumor_sites_optional_questions.html?id='+i+'">' + tumorDisplayName + '</a></div></div>';
    }
    //Add to organ grouped list
    var htmlCell = '<div class="row"><div class="col-md-12"><a href="tumor_sites_optional_questions.html?id='+i+'">' + tumorDisplayName + '</a></div></div>';
    if (organGroup != null) {
      if (tumorTypeGridHTML.hasOwnProperty(organGroup)) {
        tumorTypeGridHTML[organGroup].push(htmlCell);
      }
      else {
        organTypes.push(organGroup);
        tumorTypeGridHTML[organGroup] = [htmlCell];
      }
    }

  }
  //Add result to html
  var organTypeHTML = '<div class="row"><div class="col-md-3">';
  organTypes.sort();

  var count = 0;
  for (i=0; i< organTypes.length; i++) {
    var key = organTypes[i];
    var htmlList = tumorTypeGridHTML[key];
    count ++;
    if (count!=1){
      organTypeHTML += '</div>'
      //Add four columns per row.
      if (count%4 == 1){
        organTypeHTML += '</div><div class="row">';
      }
      organTypeHTML += '<div class="col-md-3">';
    }
    organTypeHTML += '<strong>' + key + '</strong>';
    for (j=0; j< htmlList.length; j++) {
      organTypeHTML += htmlList[j];
    }
  }


  organTypeHTML += '</div></div';
  mostCommonHTML += '</div></div>';
  otherHTML += '</div></div>';
  if (isOther){
    $('#tumor-type-grid').html(mostCommonHTML + '<br>' + organTypeHTML + '<br>' + otherHTML);
  }
  else {
    $('#tumor-type-grid').html(mostCommonHTML + '<br>' + organTypeHTML);
  }

}, 
//Report error if Firebase fails
function (errorObject) {
  console.log('The read failed: ' + errorObject.code);
});




