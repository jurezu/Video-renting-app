 [![Coverage Status](https://coveralls.io/repos/github/jurezu/Video-renting-app/badge.svg?branch=master)](https://coveralls.io/github/jurezu/Video-renting-app?branch=master)

## Introduction

This project is the backend of an imaginary video rental app implemented in Node.js.
It is used for a purpose of learning node.js.

## Setup

### Install MongoDB

To run this project, you need to install the latest version of MongoDB Community Edition first.

https://docs.mongodb.com/manual/installation/

Once you install MongoDB, make sure it's running.

### Install the Dependencies

Next, from the project folder, install the dependencies:

    npm i

### Populate the Database

    node seed.js

### Run the Tests

You're almost done! Run the tests to make sure everything is working:

    npm test

All tests should pass.

### Start the Server

    node index.js

This will launch the Node server on port 3023. If that port is busy, you can set a different point in config/default.json.

Open up your browser and head over to:

http://localhost:3023/api/genres

You should see the list of genres. That confirms that you have set up everything successfully.

### (Optional) Environment Variables

If you look at config/default.json, you'll see a property called jwtPrivateKey. This key is used to encrypt JSON web tokens. So, for security reasons, it should not be checked into the source control. I've set a default value here to make it easier for you to get up and running with this project. For a production scenario, you should store this key as an environment variable.

On Mac:

    export video_renting_jwtPrivateKey=yourSecureKey

On Windows:

    set video_renting_jwtPrivateKey=yourSecureKey
