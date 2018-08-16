NOTE

The instructions below for starting the server and running the tests assume you have node v8.7 or higher and npm5 installed


------------------------------------


STARTING THE SERVER

1. Modify db details in config.js to point to a running mongodb server
2. npm install      -> installs dependencies needed to start the server
3. npm run seed     -> this creates a new collection named 'companies' in the database specified in config.js, and seeds it with the 3 test companies from the project document
4. npm start        -> starts the server


------------------------------------


RUNNING THE TESTS

1. Modify db details in config.js to point to a running mongodb server
2. npm install -D   -> installs all dependencies, including those needed to run the tests
3. npm test         -> runs the unit and integration tests


-------------------------------------


PLACING A BID

Send a POST request to /bid

The request's content-type must be 'application/json'

Accepted params in the request body are:
    basebid     | Number | REQUIRED
    countrycode | String | OPTIONAL
    category    | String | OPTIONAL

An example request, sent from the command line using curl:
    curl -XPOST -H "Content-type: application/json" -d '{"basebid": 10, "countrycode": "US", "category": "automobile"}' 'http://localhost:8000/bid'

Response can be one of:
[400, {success: false, message: 'Aborting bid as required parameter ...'}]         | required param 'basebid' missing from request
[500, {success: false, message: 'Database error'}]                                 | database error occurred
[200, {success: false, message: 'No Companies Passed From Targeting'}]             | all companies in database failed the base targeting check
[200, {success: false, message: 'No Companies Passed From Budget'}]                | all companies that passed the targeting check failed the budget check
[200, {success: false, message: 'No Companies Passed From base BaseBid Check'}]    | all companies that passed the previous checks failed the basebid check
[200, {success: false, message: 'Bid failed as another bidder ...'}]               | when another bidder is allocated a company's final stock just as the current bid is being processed
[200, {success: true,  message: 'Winner: Cx'}]                                     | bid successful, company stock allotted


--------------------------------------


PROBLEMS

1. No multi-threading.
2. Bug in how async code is handled in bidRequestHandler will cause logs from two different, simultaneous requests to become interleaved in the log files, though no DB corruption will occur. I realized this issue too late to fix in time.
