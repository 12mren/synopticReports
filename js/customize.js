


  






// Initialize Firebase
  var config = {
    apiKey: "AIzaSyDeu5ZKrz9HqtXkJk5ibHrsJhoP-MBezXM",
    authDomain: "synopticreports.firebaseapp.com",
    databaseURL: "https://synopticreports.firebaseio.com",
    storageBucket: "",
  };

firebase.initializeApp(config);


//Sign in functions



function signOut(){
  console.log('signing out function NOW');

  //var user = firebase.auth().currentUser;  check did not check
  //console.log("useruid "+user.uid);

  firebase.auth().signOut().then(function() {
  // Sign-out successful.
  console.log("signed out");

  //return to main page
  window.location = "index.html";

  }, function(error) {
    // An error happened.
  });

}

//a watcher to make sure user authenticated before showing page
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    

// User is signed in.
    console.log('user AUTH  NOW logged in')
    
    console.log("email "+user.email);
    console.log("useruid "+user.uid);

    document.getElementById("usernamedisplay").style.display = "block";
    document.getElementById("usernamedisplay").textContent = user.email;

// Get a reference to the database service
var database = firebase.database();



//get the users current input choice and display it
database.ref('/users/').once('value').then(function(snapshot) {
  //Get get current choice and display it, make variable global for later writing function
  var users = snapshot.val();
  current_choice = users[user.uid].input_choice; 
  document.getElementById("current").textContent =  current_choice;

  // get global user info for updating
  // currentUserId = currentUser.uid;
  // currentUserName = users[user.uid].name;
  currentUserOutputChoice = users[user.uid].output_choice;
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

} else {
    // No user is signed in.
    console.log ('user AUTH logged out');
    
  }
});


//function to write the new output choice to the database
 function writeUserData(uId, useremail, d_input, d_output) {
      firebase.database().ref('/users/' + uId).set({
        email: useremail,
        input_choice: d_input,
        output_choice : d_output
       
    });
   }


//Fucntion to see what the user chose and to change both the database and the current choice on the website
function change_input(){
  // Get a reference to the database service
  var database = firebase.database();



  //get the users current input choice and display it
  database.ref('/users/').once('value').then(function(snapshot) {
  //Get get current choice and display it, make variable global for later writing function
  var users = snapshot.val();

  var user = firebase.auth().currentUser;
  currentUserOutputChoice = users[user.uid].output_choice; 



  //get the users choice from the radio buttons
  var k = $("input[name=rate]:checked").val();
  
  //put in html format
  var h ='<p>'+k+'</p>'
  
  //update webpage
  $('#current').html(h);

  //update database with new choice with the writeUserData function
  
  writeUserData(user.uid, user.email, k, currentUserOutputChoice);

});
}
















