#!/usr/bin/env node
const fs = require('fs');
var AWS = require('aws-sdk');

// This script uploads a set of jpeg images to s3 in predefined batch sizes
// A sequential 'batch-id' is prepended to the s3dirname to organise the uploads into folders

// Grab provided args
var argv = require('minimist')(process.argv.slice(2));

if (argv.h) {
  console.log('Use: s3upload [-h] [--b **s3bucketname** required] [--i **initial-file-index** required] [--d **s3dirPrefix** required] [--s **batch-size** required]');
}
else {
  //----------------------------------------------
  // Check required argv are provided
  //----------------------------------------------
  var inputValidation = true;
  if (!argv.b || typeof argv.b !== 'string') {
    console.log('Require s3bucketname arg [--b **s3bucketname**] -> type string');
    inputValidation = false;
  }

  if (!argv.d || typeof argv.d !== 'string') {
    console.log('Require s3dirPrefix arg [--d **s3dirname**] -> type string');
    inputValidation = false;
  }

  if ((!argv.i && argv.i !== 0) || typeof argv.i !== 'number') {
    console.log('Require batch-size arg [--s **batch-size**] -> type number');
    inputValidation = false;
  }

  if (!argv.s || typeof argv.s !== 'number') {
    console.log('Require batch-size arg [--s **batch-size**] -> type number');
    inputValidation = false;
  }

  if (inputValidation){

    var bucketName = argv.b;
    var s3dirPrefix = argv.d;
    var initialFileIndex = argv.i;
    var batchSize = argv.s;

    //----------------------------------------------
    // Validation
    //----------------------------------------------
    // ...Validations go here...

    //-------------------------------------------------------
    // Read directory content where the script is being run
    //-------------------------------------------------------
    var files = fs.readdirSync('./');
    var filesToUpload = [];

    files.forEach(file => {
      if (file.match(/.*.jpg$/)) {
        filesToUpload.push(file);
      }
    });

    console.log(`${filesToUpload.length} files found for upload. Uploading in batches of ${batchSize}`)

    // Create the s3 object to use in uploading to AWS S3
    var s3 = new AWS.S3();
    filesToUpload.forEach((file, index) => {

      var fileData = fs.readFileSync(file);
      var s3dirname = s3dirPrefix + (initialFileIndex + Math.floor(index / batchSize))

      var params = {
        Body: fileData,
        Bucket: bucketName,
        Key: s3dirname + '/' + file,
        ContentType: 'image/jpeg',
      };

      // console.log(params);

      s3.putObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
      });
    });
  }
}
