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
        mostCommonHTML += '<div class="row"><div class="col-md-12"><a href="tumor_sites.html?id='+i+'">' + tumorDisplayName + '</a></div></div>';
    }
    if (organGroup == null) {
      isOther = true;
      otherHTML += '<div class="row"><div class="col-md-12"><a href="tumor_sites.html?id='+i+'">' + tumorDisplayName + '</a></div></div>';
    }
    //Add to organ grouped list
    var htmlCell = '<div class="row"><div class="col-md-12"><a href="tumor_sites.html?id='+i+'">' + tumorDisplayName + '</a></div></div>';
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





//Sign in functions


var default_input = "baptist";
var default_output = "Word";

function writeUserData(uId, u_email, d_input, d_output) {
      firebase.database().ref('/users/' + uId).set({
        email: u_email,
        input_choice: d_input,
        output_choice : d_output,   
    });
   }


//set a watcher on the user
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
     // User is signed in.
    console.log('user AUTH  NOW logged in')
    
    console.log("email "+user.email);
    console.log("useruid "+user.uid);

    document.getElementById("usernamedisplay").style.display = "block";
    document.getElementById("usernamedisplay").textContent = user.email;
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("register").style.display = "none";
    document.getElementById("SignOutButton").style.display = "block";

    modal.style.display = "none";


    //check to see if user in data base
    ///get user database with a reference to the database service
    var database = firebase.database();

    //see users
    database.ref('/users/').once('value').then(function(snapshot){
      //set user list
      var users = snapshot.val();

      //see if already in list
      if (user.uid in users ) {
        console.log("in list");
        //get users input choice and make global without var
        userInputChoice = (users[user.uid].input_choice);
        
     
      }

      else {
          console.log("not in list, will write it in");
          writeUserData(user.uid, user.email, default_input, default_output);
          userInputChoice = default_input;
      } 
    });

  } else {
      console.log ('user AUTH logged out');
      document.getElementById("usernamedisplay").style.display = "none";
      document.getElementById("usernamedisplay").textContent = "id";
      document.getElementById("loginButton").style.display = "block";
      document.getElementById("register").style.display = "block";
      document.getElementById("SignOutButton").style.display = "none";
    }
});



function login(){
  console.log('doing login function');
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // ...
  }); 
}

function register(){
  console.log('there');
  var username = document.getElementById("newUsername").value;
  var password = document.getElementById("newPassword").value;
  var email = document.getElementById("newEmail").value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  if (errorCode == 'auth/weak-password') {
    alert('The password is too weak.');
  } else {
    alert(errorMessage);
  }
  console.log(error);
});

  // console.log(newUsername);
  // console.log(newPassword);
  // console.log(newEmail);

  // document.getElementById("usernamedisplay").style.display = "block";
  // document.getElementById("usernamedisplay").textContent = newEmail;
  // document.getElementById("loginButton").style.display = "none";
  // document.getElementById("SignOutButton").style.display = "block";

  // modal.style.display = "none";


}

function signOut(){
  console.log('signing out function NOW');
  


  var user = firebase.auth().currentUser;
  console.log("useruid "+user.uid);

  firebase.auth().signOut().then(function() {
  // Sign-out successful.
  console.log("signed out");

  }, function(error) {
    // An error happened.
  });

  modal.style.display = "none";


}





// // Initializes a session with Syn Rep (Synoptic Reports).
// function SynRep() {
//   this.checkSetup();

//   // Shortcuts to DOM Elements.
//   this.messageList = document.getElementById('messages');
//   this.messageForm = document.getElementById('message-form');
//   this.messageInput = document.getElementById('message');
//   this.submitButton = document.getElementById('submit');
//   this.submitImageButton = document.getElementById('submitImage');
//   this.imageForm = document.getElementById('image-form');
//   this.mediaCapture = document.getElementById('mediaCapture');
//   this.userPic = document.getElementById('user-pic');
//   this.userName = document.getElementById('user-name');
//   this.signInButton = document.getElementById('sign-in');
//   this.signOutButton = document.getElementById('sign-out');
//   this.signInSnackbar = document.getElementById('must-signin-snackbar');

//   // Saves message on form submit.
//   //this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
//   this.signOutButton.addEventListener('click', this.signOut.bind(this));
//   this.signInButton.addEventListener('click', this.signIn.bind(this));

//   // Toggle for the button for writing.
//   //var buttonTogglingHandler = this.toggleButton.bind(this);
//   //this.messageInput.addEventListener('keyup', buttonTogglingHandler);
//   //this.messageInput.addEventListener('change', buttonTogglingHandler);

 
//   this.initFirebase();
// }

// // Sets up shortcuts to Firebase features and initiate firebase auth.
// SynRep.prototype.initFirebase = function() {
//   // Shortcuts to Firebase SDK features.
//   this.auth = firebase.auth();
//   this.database = firebase.database();
//   //this.storage = firebase.storage();
//   // Initiates Firebase auth and listen to auth state changes.
//   this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
// };

// // Returns true if user is signed-in. Otherwise false and displays a message.
// SynRep.prototype.checkSignedInWithMessage = function() {
//   // Return true if the user is signed in Firebase
//   if (this.auth.currentUser) {
//     return true;
//   }

//   // Display a message to the user using a Toast.
//   var data = {
//     message: 'You must sign-in first',
//     timeout: 2000
//   };
//   this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
//   return false;
// };

//   // Checks that the Firebase SDK has been correctly setup and configured.
// SynRep.prototype.checkSetup = function() {
//   if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
//     window.alert('You have not configured and imported the Firebase SDK. ' +
//         'Make sure you go through the codelab setup instructions.');
//   } else if (config.storageBucket === '') {
//     window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
//         'actually a Firebase bug that occurs rarely. ' +
//         'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
//         'and make sure the storageBucket attribute is not empty. ' +
//         'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
//         'displayed there.');
//   }
// };


// // Signs-in Syn Rep.
// SynRep.prototype.signIn = function() {
//   // Sign in Firebase using popup auth and Google as the identity provider.
//   var provider = new firebase.auth.GoogleAuthProvider();
//   this.auth.signInWithPopup(provider);

  
// };

// // Signs-out of Syn Rep.
// SynRep.prototype.signOut = function() {
//   // Sign out of Firebase.
//   this.auth.signOut();
// };

// // Triggers when the auth state change for instance when the user signs-in or signs-out.
// SynRep.prototype.onAuthStateChanged = function(user) {
//   if (user) { // User is signed in!
    
//     var userName = user.displayName;
  
//     ///get user database with a reference to the database service
//     var database = firebase.database();

//   //see users
//   database.ref('/users/').once('value').then(function(snapshot){
//   //set user list
//   var users = snapshot.val();

  

//   //get users input choice and make global without var
//   userInputChoice = (users[user.uid].input_choice);

//   if (user.uid in users ) {
   
//     console.log("in list");
   
//   }
//   else {
//     console.log("not in list");
//     function writeUserData(uId, username, d_input, d_output) {
//       firebase.database().ref('/users/' + uId).set({
//         username: username,
//         input_choice: d_input,
//         output_choice : d_output
        
//     });
//    }

//    writeUserData(user.uid, userName, default_input, default_output);

 
//   };

// });



    
//     this.userName.textContent = userName;
   
//     // Show user's profile and sign-out button.
//     this.userName.removeAttribute('hidden');
    
//     this.signOutButton.removeAttribute('hidden');

//     // Hide sign-in button.
//     this.signInButton.setAttribute('hidden', 'true');
  
//     // We load currently existing chant messages.
//    // this.loadMessages();
//   } else { // User is signed out!
//     // Hide user's profile and sign-out button.
//     this.userName.setAttribute('hidden', 'true');
//     //this.userPic.setAttribute('hidden', 'true');
//     this.signOutButton.setAttribute('hidden', 'true');

//     // Show sign-in button.
//     this.signInButton.removeAttribute('hidden');
//   }

  

// };



// window.onload = function() {
//   window.SynRep = new SynRep();
// };








