# Argo Discover

A Discover tool for Node.js application running on Argo (and Harbor).

[![Build Status](https://travis-ci.org/turnerlabs/argo-discover.svg?branch=master)](https://travis-ci.org/turnerlabs/argo-discover)


## Usage

Discover is a function that can be called with up to three arguments and returns a Promise, that
once resolved, is an array of hosts.


### Arguments

+ `product` String. Required. Product to Discover.

+ `environment` String. Optional. Environment to use to Discover `product`. If blank, uses
`$ENVIRONMENT` (which is provided by Argo/Harbor).

+ `location` String. Optional. Location to use to Discover `product` `environment` pair. Location
can only be used if `environment` is used. If blank, uses `$LOCATION` (which is provided by
Argo/Harbor)


### Returns

A Promise object.


### Example

```
#!javascript
const discover = require("discover");

discover("<product name>"[, "<environment>"[, "<location>"]]).then(
    (data) => {
        // On success, data will be an array of hosts
    },
    (reason) => {
        // If there were any errors, reason will tell you what they were
    }
);
```


## Author

Wilson Wise
