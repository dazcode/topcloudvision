

////////////////////
//HTTP REQUEST AND FILE IMPORTS
const requestAPI = require('request');
var fs = require('fs');
const path = require('path');


////////////////////
//MAIN TOPCLOUDVISION SERVICE CALL
exports.runVisionServices = function (signedUrl,inputImage, bucketName, configData,AWS) {

  let imageName = path.basename(inputImage);
  let imageUrl =  signedUrl;
 
  //console.log(imageUrl);
  return new Promise(function (res, rej) {

    var promise1 = new Promise(function (resolve, reject) {
      callVisionApiAWS(imageName, bucketName,AWS,  resolve, reject);
    });
    var promise2 = new Promise(function (resolve, reject) {
      callVisionApiGoogle(imageUrl, configData['googleEndpoint'], configData['googleKey'], resolve, reject);
    });
    var promise3 = new Promise(function (resolve, reject) {
      callVisionApiAzure(imageUrl, configData['azureEndpoint'], configData['azureKey'], resolve, reject);
    });

    Promise.all([promise1, promise2, promise3]).then(function (values) {

      return res(values);

    });
  })
}

////////////////////
//CREATE S3 BUCKET
exports.checkBucket = function (bucketName, configData, AWS) {

  return new Promise(function (res, rej) {
    
    let s3 = new AWS.S3(AWS.config);

    s3.createBucket({
      Bucket: bucketName
    }, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        //console.log("Bucket success")
        res(true);
      }
    });
    
  })
}




////////////////////
//FORMAT JSON RESPONSE
var convertSmartLabels = function (providerId, serviceJson) {

  var labelsArray = Array();
  switch (providerId) {
    case "gcloud":

      for (var i = 0; i < serviceJson.responses[0].labelAnnotations.length; i++) {
        var tmpItem = {
          labelType: 'categories',
          labelValue: serviceJson.responses[0].labelAnnotations[i]['description'],
          labelConfidence: " " + Math.floor(serviceJson.responses[0].labelAnnotations[i]['score'] * 100),
          labelSource: providerId
        };
        labelsArray.push(tmpItem);

      }

      break;
    case "aws":

      for (var i = 0; i < serviceJson.run_smart_labels.Labels.length; i++) {
        var tmpItem = {
          labelType: 'categories',
          labelValue: serviceJson.run_smart_labels.Labels[i]['Name'],
          labelConfidence: " " + Math.floor(serviceJson.run_smart_labels.Labels[i]['Confidence']),
          labelSource: providerId
        };
        labelsArray.push(tmpItem);

      }

      break;
    case "azure":

      for (var i = 0; i < serviceJson.categories.length; i++) {
        var tmpItem = {
          labelType: 'categories',
          labelValue: serviceJson.categories[i]['name'],
          labelConfidence: " " + Math.floor(serviceJson.categories[i]['score']),
          labelSource: providerId
        };
        labelsArray.push(tmpItem);

      }
      break;
    default:
      labelsArray = "";
  }

  return labelsArray;
}



var configureAWS = function(configData){
  let AWS = require("aws-sdk");
  AWS.config = new AWS.Config();
  AWS.config.accessKeyId = configData["accessKeyId"]
  AWS.config.secretAccessKey = configData["secretAccessKey"];
  AWS.config.region = configData["region"];
  return AWS;
}
exports.configureAWS = configureAWS;


//////////////////
// AWS VISION SERVICE CALL
var callVisionApiAWS = function (imageName, bucketName,AWS,  resolve, reject) {

  var params = {
    Image: {
      S3Object: {
        Bucket: bucketName,
        Name: imageName
      }
    }
  };

  var rekognition = new AWS.Rekognition(AWS.config);

  rekognition.detectLabels(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {

      var providerId = "aws";
      var serviceJson = {};
      serviceJson.run_smart_labels = data;

      var convertedData = convertSmartLabels(providerId, serviceJson);
      resolve(convertedData);

    }
  });
}


//////////////////
// GCLOUD VISION SERVICE CALL
var callVisionApiGoogle = function (imageURL, serviceUrl, serviceKey, resolve, reject) {

  var googleServiceUrl = serviceUrl + ":annotate?key=" + serviceKey;
  var myJSONObject = {
    "requests": [{
      "image": {
        "source": {
          "imageUri": imageURL
        }
      },
      "features": [{
        "type": "LABEL_DETECTION"
      }]
    }]
  };
  requestAPI({
    url: googleServiceUrl,
    method: "POST",
    json: true,
    body: myJSONObject
  }, function (error, response, body) {



    var providerId = "gcloud";
    var serviceJson = body;

    //console.log(body);

    var convertedData = convertSmartLabels(providerId, serviceJson);
    resolve(convertedData);





  });
}


//////////////////
// AZURE VISION SERVICE CALL
var callVisionApiAzure = function (imageURL, serviceEndpoint, serviceKey, resolve, reject) {

  var myJSONObject = {
    "url": imageURL
  };
  var serviceUrl = serviceEndpoint;
  requestAPI({
    url: serviceEndpoint,
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': serviceKey
    },
    body: myJSONObject,
    json: true
  }, function (error, response, body) {


    var providerId = "azure";
    var serviceJson = body;

    //console.log(body);


    var convertedData = convertSmartLabels(providerId, serviceJson);
    resolve(convertedData);


  });

}

exports.loadConfig = (filepath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, content) => {
      if (err) {
        reject(err)
      } else {
        try {
          resolve(JSON.parse(content));
        } catch (err) {
          reject(err)
        }
      }
    })
  });
}







exports.uploadImage = (inputImage, bucketName, configData,AWS) => {
  return new Promise((resolve, reject) => {

    let imageName = path.basename(inputImage);
    let s3 = new AWS.S3();

    var fileStream = fs.createReadStream(inputImage);
    var params = {
      Bucket: bucketName,
      Key: imageName,
      Expires: configData['signedExpireTime']
    };
    
    s3.putObject({
      Bucket: bucketName,
      Key: imageName,
      Body: fileStream
    }, function (resp) {

      var url = s3.getSignedUrl('getObject', params);
      //encodedUrl = encodeURI(url);

      resolve(url);
    })


  });
}
