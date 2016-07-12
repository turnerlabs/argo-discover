/*global before, describe, it */
"use strict";

const expect = require("chai").expect,
    nock     = require("nock"),
    discover = require("../index");

let uri = "http://idb.services.dmtio.net",
    res = [
        {
            about: "No protocol, with port",
            ipaddress: "1.2.3.4",
            config: {
                PORT: "5678"
            }
        },
        {
            about: "With protocol, with port",
            ipaddress: "2.3.4.5",
            config: {
                PORT: "6789",
                PROTOCOL: "redis"
            }
        },
        {
            about: "No port, with protocol",
            ipaddress: "3.4.5.6",
            config: {
                PROTOCOL: "mongodb"
            }
        },
        {
            about: "No port, no protocol",
            ipaddress: "4.5.6.7",
            config: {}
        }
    ];

/*
 * Mixing use of arrow functions because Mocha discourages their use,
 * but I like them in the Promises. http://mochajs.org/#arrow-functions
 */
describe("Discover module", function () {
    beforeEach(() => {
        process.env.LOCATION = "ec2";
        process.env.ENVIRONMENT = "dev";

        nock(uri)
            .get("/instances/fake-product/dev?q=location:ec2+AND+NOT+offline:true")
            .reply(200, res);
    });

    it("should be an function", function () {
        expect(discover).to.be.a("function");
    });

    it("should return a Promise", function (done) {
        var p = discover("fake-product", "dev", "ec2");

        expect(p).to.be.instanceOf(Promise);

        p.then(
            (data) => {
                done();
            },
            (reason) => {
                done(reason);
            }
        );
    });

    it("should fetch hosts when product, environment, and location are supplied", function (done) {
        discover("fake-product", "dev", "ec2").then(
            (data) => {
                expect(data).to.be.instanceOf(Array);

                expect(data[0]).to.be.a("string");
                expect(data[0]).to.equal("http://1.2.3.4:5678");

                expect(data[1]).to.be.a("string");
                expect(data[1]).to.equal("redis://2.3.4.5:6789");

                expect(data[2]).to.be.a("string");
                expect(data[2]).to.equal("mongodb://3.4.5.6");

                expect(data[3]).to.be.a("string");
                expect(data[3]).to.equal("http://4.5.6.7");

                done();
            },
            (reason) => {
                done(reason);
            }
        );
    });

    it("should fetch hosts when product and environment are supplied, but location is not", function (done) {
        discover("fake-product", "dev").then(
            (data) => {
                expect(data).to.be.instanceOf(Array);

                expect(data[0]).to.be.a("string");
                expect(data[0]).to.equal("http://1.2.3.4:5678");

                expect(data[1]).to.be.a("string");
                expect(data[1]).to.equal("redis://2.3.4.5:6789");

                expect(data[2]).to.be.a("string");
                expect(data[2]).to.equal("mongodb://3.4.5.6");

                expect(data[3]).to.be.a("string");
                expect(data[3]).to.equal("http://4.5.6.7");

                done();
            },
            (reason) => {
                done(reason);
            }
        );
    });

    it("should fetch hosts when product is supplied, but environment and location are not", function (done) {
        discover("fake-product").then(
            (data) => {
                expect(data).to.be.instanceOf(Array);

                expect(data[0]).to.be.a("string");
                expect(data[0]).to.equal("http://1.2.3.4:5678");

                expect(data[1]).to.be.a("string");
                expect(data[1]).to.equal("redis://2.3.4.5:6789");

                expect(data[2]).to.be.a("string");
                expect(data[2]).to.equal("mongodb://3.4.5.6");

                expect(data[3]).to.be.a("string");
                expect(data[3]).to.equal("http://4.5.6.7");

                done();
            },
            (reason) => {
                done(reason);
            }
        );
    });

    it("should handle a 404", function (done) {
        nock(uri)
            .get("/instances/missing-product/dev?q=location:ec2+AND+NOT+offline:true")
            .reply(404, res);

        discover("missing-product").then(
            (data) => {
                done(data);
            },
            (reason) => {
                expect(reason).to.be.instanceOf(Error);

                done();
            }
        );
    });
});
