var cloudServices = require('../scripts/topCloudVisionServices.js');

/**
 * TOPCLOUDVISION 0.0.1
 * 
 * @param {*} inputImage - path to local image file (example: "./image.jpg")
 * @param {*} bucketName - name of s3 bucket to store uploaded image (example: "mybucketname")
 * @param {*} configFile - path to local cloud credentials json file (example: "./config.json")
 */


async function runTopCloudVision(configFile, inputImage, bucketName = "") {
  let theResult = [];
  let configData = await cloudServices.loadConfig(configFile)
  let AWS = cloudServices.configureAWS(configData);

  if (bucketName == "") {
    bucketName = configData['defaultBucketName'];
  }

  theResult["checkBucket"] = await cloudServices.checkBucket(bucketName, configData, AWS);
  theResult["uploadImage"] = await cloudServices.uploadImage(inputImage, bucketName, configData, AWS);
  theResult["runVisionServices"] = await cloudServices.runVisionServices(theResult["uploadImage"], inputImage, bucketName, configData, AWS);

  return Promise.resolve(theResult);
}

module.exports.runTopCloudVision = runTopCloudVision;

