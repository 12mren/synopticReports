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
      tumorDisplayName += " biopsy [" + tumorType.biopsy_type + "]";
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






