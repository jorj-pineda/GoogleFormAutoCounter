# Google-Form-Auto-Counter
Made for the Service Station of Austin College. 
Great Day of Service is one of the big events we run that connects students to 40+ volunteer sites in Texoma area, and a problem we encountered was keeping track of participants in each volunteer site.

This form counter allows forms to close as soon as X participants is reached, allowing for easier processesing of volunteers.

Created November 2024
<pre>









## Instructions

These are the instructions to the code for automated google forms for GDS made by yours truly: Jorge Pineda, Fall 2024. 


Any updates to the code specify below and state your name and semester of making updates:
____ ____ _____
Jorge Pineda, Summer 2025

HERE ARE THE INSTRUCTIONS: 

This is the link to the form with the original code: https://docs.google.com/forms/d/1Ns4Gjiw8NV4ALqtHVWmfNrP7TKekzQdgy-jmQbAkPW0/edit

### Code.gs -> Counter.gs
### Test.html -> Front.html

This will take you to this place: 

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture1.png "pic 1")

To access the code you need to go into the script editor: 


![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture2.png "pic 2")

Next you will see a series of things, but don’t worry. We’ll go through each step.  

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture3.png "pic 3")



This is what you are met with. The code in Code.gs is the main code that will help with updating the form. You will copy this WHOLE thing and paste it into your desired form’s script editor.

   -it automatically has things that tell you what to edit, I will go through example later if needed

Next is the HTML, the front end of the code. 

You will click the + sign and add an HTML because it will not automatically put it in IN YOUR PROJECT

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture4.png "pic 4")

The title is arbitrary, just make one and title what you like. 


You will click on Front.html in the original doc where you find the code for the HTML to add onto YOUR project


![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture5.png "pic 5")

Copy and paste original code into new HTML you just made in your project and change to your fitting. 




Next you will deploy to add trigger. Click on deploy top right and do the following 
Select type and click web app. Then name the title to the corresponding form. Then keep options as seen and hit deploy. Authorize the access and boom (yes it’s fine I am not hacking your computer) Click done when you finished

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture6.png "pic 6")

NEXT you will make a Trigger that will automatically update forms based on responses. 


![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture7.png "pic 7")


You will want to click on triggers on the left side. 


![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture8.png "pic 8")
 
You will want to click add trigger in bottom right in the blue. 



![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture9.png "pic 9")

**CHANGE TO ON FORM SUBMIT FOR EVENT SOURCE**
Using time based will have the form update every single minute

Then click save


NOW you will go back to editor with Counter.gs and click RUN

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture10.png "pic 10")
 
Once you click run you will see these logs 

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture11.png "pic 11")
 

That means it’s running correctly. You can test by filling a form out and it should update within a minute. 


That concludes the instructions. Below is an example to help if you are having trouble





### EXAMPLE TO HELP

We will use Texoma Crisis Center 2024 as an example.
![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture12.png "pic 12")
 

Copy Counter.gs from original code from “FormCounter” (link above): 

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture13.png "pic 13")

Paste into your form’s empty script editor: 

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture14.png "pic 14")  


![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture15.png "pic 15")

Next we update code in Texoma Crisis Center to fit it’s needs

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture16.png "pic 16")
 
Copy THIS PART of the form, right after /d/ and before /edit

 ![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture17.png "pic 17")
 
Paste into this part of the code

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture18.png "pic 18")

 
Update the total # of spots to fit the site

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture19.png "pic 19")

 
Update the title and change the /5 to /# of spots total


 ![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture20.png "pic 20")

Now you are finished with Counter.gs.

Now we add a HTML like we did earlier

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture21.png "pic 21")

Change to HTML to your fitting

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture22.png "pic 22")
 
Change title and /5 to /# of total spots in HTML code to fit the site: 


![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture23.png "pic 23")

Now deploy the code after saving it with Ctrl + S: 
 
![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture24.png "pic 24")

Now add a trigger as stated above:

 ![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture25.png "pic 25")
 

**CHANGE TIME DRIVEN TO ON FORM SUBMIT** (2025)

Now click Run in Counter.gs and make sure no errors: 

![alt text](https://github.com/jorj-pineda/GoogleFormAutoCounter/blob/main/InstructionImages/Picture26.png "pic 26")

Then your form will now update based on total spots and close automatically when it’s full! (I think)




IF CODE DOESN’T WORK: Call Jorge (956) 408-5230
</pre>
