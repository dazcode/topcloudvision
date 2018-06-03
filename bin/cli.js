#!/usr/bin/env node

var program = require('commander');
var tcvision = require('./index');

program
    .name('tcvision')
    .description('Send an image to the top 3 cloud vision apis and format the json result')
    .version('0.0.1')
    .option('-i, --image [filename]', 'input image filename (required)')
    .option('-c, --config [filename]', 'config file (required)')
    .option('-b, --bucket [filename]', 's3 bucket to use (override config default)')
    .parse(process.argv);

//Optionally read the config file location from an environment variable
var tcvconfigfile = process.env.TCVCONFIGFILE;
if (program.config) {
    tcvconfigfile = program.config;
}


let inputImage = program.image;
let bucketName = program.bucket;

if(!tcvconfigfile){
    console.log('TopCloudVision config file required. (example: -c config.json)')
}
if(!inputImage){
    console.log('Input image required. (example: -i image.jpg)')
}



tcvision.runTopCloudVision(tcvconfigfile, inputImage,bucketName).then(function (response) {
    console.log(response['runVisionServices'])
});