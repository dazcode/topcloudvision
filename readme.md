
[![npm version](https://badge.fury.io/js/tcvision.svg)](https://badge.fury.io/js/topcloudvision)

**Top Cloud Vision** – Send an image to the top 3 cloud vision apis and format the json result

This project offers a quick and easy way to compare the latest image analysis services offered by Google, Azure and AWS.

This first release features smart image labels detection. Support for more api features will be implemented in the upcoming version.

[View Demo Examples](https://github.com/dazcode/topcloudvision/tree/master/test)


* QuickStart
* Contact

## Quick Start

**Install the node package:**
  ```bash
  npm install tcvision -g
  ```

**Configure a cloud services credentials file:**

Edit the example config.json and configure all required fields marked with '****'
  ```bash
 {   
    "accessKeyId": "****",
    "secretAccessKey": "****",
    "region": "us-east-1",
    "defaultBucketName": "****",
    "signedExpireTime":600,
    
    "azureKey": "****",
    "azureEndpoint": "https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/analyze",

    "googleKey": "****",
    "googleEndpoint": "https://vision.googleapis.com/v1/images"
}
  ```

**Run from command line or use in your node project:**
 
 Command line usage:
  ```bash
  # This will output the result json to the console
  tcvision -i image.jpg -c config.json
  ```
 
 Use in your node project:
  ```javascript
//////////////////////////////////////
//// EXAMPLE USAGE:
var tcvision = require('tcvision');

let inputImage = "image.jpg";
let configFile = "config.json";

tcvision.runTopCloudVision(configFile,inputImage,bucketName).then(function(response){
  console.log(response['runVisionServices'])
});
//////////////////////////////////////
  ```



## Contact

David Zentner dazcode@gmail.com

