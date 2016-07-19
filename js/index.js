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
  var tumorTypeGridHTML ='<div class="row"><div class="col-md-3">';
  var mostCommonHTML = '<div class="row"><div class="col-md-12">Most Common';
  var letterCount = 0;
  var previousLetter = ''
  //Add tumor types to most common table and alphabetical table
  for (i=0; i<tumorTypes.length; i++) {
    var tumorType = tumorTypes[i];
    var tumorName = tumorType.name;
    var tumorProperties = tumorType.properties;
    var tumorDisplayName = tumorName;
    //Add coming soon remark to unimplemented tumor types
    if (tumorProperties == null) {
        tumorDisplayName += " (Coming Soon)"
    }
    //If is a most common tumor type, add to most common
    if (tumorType.most_common) {
        mostCommonHTML += '<div class="row"><div class="col-md-12"><a href="tumor_sites.html?id='+i+'">' + tumorDisplayName + '</a></div></div>';
    }
    //Add to alphabetical list
    if (tumorName[0]!=previousLetter) {
        letterCount += 1;
        previousLetter = tumorName[0];
        if (letterCount!=1) {
            tumorTypeGridHTML += '</div>';
            //Add four columns per row.
            if (letterCount%4 == 1) {
                tumorTypeGridHTML += '</div><div class="row">'; 
            }
            tumorTypeGridHTML += '<div class="col-md-3">';
        }
        tumorTypeGridHTML +=  previousLetter;
    }
    tumorTypeGridHTML += '<div class="row"><div class="col-md-12"><a href="tumor_sites.html?id='+i+'">' + tumorDisplayName + '</a></div></div>'

  }
  //Add result to html
  tumorTypeGridHTML += '</div></div>';
  mostCommonHTML += '</div></div>';
  $('#tumor-type-grid').html(mostCommonHTML + tumorTypeGridHTML);

}, 
//Report error if Firebase fails
function (errorObject) {
  console.log('The read failed: ' + errorObject.code);
});






