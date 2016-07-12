"use strict";

const get = require("http").get;

let idbUrl  = process.env.IDB_URL || "http://idb.services.dmtio.net",
    idbPath = "/instances/$PRODUCT/$ENVIRONMENT?q=location:$LOCATION+AND+NOT+offline:true";

module.exports = (p, e, l) => {
    let product     = p,
        environment = e || process.env.ENVIRONMENT,
        location    = l || process.env.LOCATION,
        path;

    path = idbPath
        .replace("$PRODUCT", product)
        .replace("$ENVIRONMENT", environment)
        .replace("$LOCATION", location);

    return new Promise((resolve, reject) => {
        get(idbUrl + path, (res) => {
            let body = [];

            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                body.push(chunk);
            });
            res.on("end", () => {
                let result;

                body.join("");

                if (res.statusCode == 200) {
                    body = JSON.parse(body);

                    result = body.map((cur) => {
                        let proto = cur.config.PROTOCOL ? cur.config.PROTOCOL +"://" : "http://",
                            ipadd = cur.ipaddress || "",
                            port  = cur.config.PORT ? ":"+ cur.config.PORT : ""

                        return `${proto}${ipadd}${port}`;
                    });

                    resolve(result);
                } else {
                    reject(new Error(`${res.statusCode} ${res.statusMessage} - ${path}`));
                }
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
};
