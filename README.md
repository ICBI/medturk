medTurk
=======

medTurk (inspired by Amazon's Mechanical Turk) supports clinical research by using the ingenuity of humans to convert unstructured clinical notes into structured information.

### What it is?
It's software (*i.e., a web application*) you host privately. It allows multiple curators to answer questions in parallel on clinical notes analogous to the way Amazon Mechanical Turk operates. Their answers are then downloadable in CSV for analysis in your favorite analysis software (e.g., Python, R, Excel).

### Can you give me a quick example?
Suppose you have a set of clinical notes for childhood cancer survivors and among many things, you are interested in each child's cancer diagnosis. After uploading this set of clinical notes into medTurk, you can create a questionnaire that contains questions such as, **Was this patient diagnosed with ALL?** . You then assign allowable answer choices such as **Yes**, **No**, and **Not Sure**. In addition, you must assign keywords such as **ALL** and **acute lymphoblastic leukemia**. medTurk uses these keywords to locate passages of text that are probably relevant to answering the question. After you have assigned curators for this particular application, a curator can login and be presented with a question such as shown below:

![alt tag](images/question.png)

The curator may then view all relevant passages of text over time (specific to a particular patient) to determine the answer to this question. Each curator is presented with a different question. The **status** field in this screenshot indicates how many more questions must be answered (in this case, 8 of 87 have been answered).

At any time, an admin of medTurk may download answered data in CSV and obtains a file such as below:

![alt tag](images/csv.png)

This file contains structured data of course and can be subject to statistical analysis.



Installation
=======
**1.** TODO: Explain how to install MongodDB

**2.** TODO: Explain how to install NodeJS

**2.** TODO: Explain how to generate certificate

Running medTurk
=====
Open terminal and run:
```sh
sudo node server.js
```
Navigate to **https://localhost** in your web browser. You should see the following

![alt tag](images/home.png)

Use the following credentials to login:

**E-mail:**   admin

**Password:** password

Be sure to change your password upon login.

Admin Page
=====
You should now see the following page:

![alt tag](images/admin.png)

This is the *Admin Page*. Only users of role *Admin* are permitted to view this page. Let's try an example.