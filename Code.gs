function updateFormTitle() {
  var form = FormApp.openById('1Sg4l_cVt-47N5lNyMev_FHxuZ_qA3lKEGKyh2ZRYJ2Y'); //THE LINK TO THE RIGHT IS THE SPECEFIC LINK FOR EACH FORM
  var responses = form.getResponses();
  var totalSpots = 20; // Set your total spots here
  var remainingSpots = totalSpots - responses.length;
  //form.setTitle("Test" + remainingSpots)



  Logger.log('Remaining Spots: ' + remainingSpots);

  if (remainingSpots <= 0) {
    form.setAcceptingResponses(false); // Close the form
    form.setTitle('Masterkey Ministries - No Spots Left'); //Change "Form Closed" to title of site
    form.setCustomClosedFormMessage('This site is full, please sign up for another site!!!')
    Logger.log('Form Closed - No Spots Left');
  } else {
    form.setTitle('Masterkey Ministries: ' + remainingSpots + "/20 spots"); //SET TITLE HERE TOO
    Logger.log('Title Updated to: Spots Left: ' + remainingSpots);
  }
}

function createTrigger() {
  ScriptApp.newTrigger('updateFormTitle')
           .timeBased()
           .everyMinutes(1)
           .create();
}
