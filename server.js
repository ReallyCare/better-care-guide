var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var csp = require("node-csp");
var port = 3004;
var map = {
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword"
};
var options = {
    directives: {
        defaultSrc: ["self"],
        styleSrc: ["self"],
        imgSrc: ["self"],
        fontSrc: ["self"],
        scriptSrc: ["self"]
    }
};
http
    .createServer(function (req, res) {
    console.log(req.method + " " + req.url);
    // security headers
    csp.add(req, res, options);
    res.setHeader("Strict-Transport-Security", "max-age=15768000");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // parse URL
    var parsedUrl = url.parse(req.url);
    // extract URL path
    var pathname = "./public" + parsedUrl.pathname;
    // don't let people get root access
    pathname = pathname.replace(/^(\.)+/, ".");
    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
    var ext = path.parse(pathname).ext || ".html";
    // maps file extention to MIME typere
    fs.access(pathname, function (err) {
        if (err) {
            res.writeHead(302, {
                Location: "/index.html"
            });
            res.end();
        }
        else {
            // if is a directory search for index file matching the extention
            if (fs.statSync(pathname).isDirectory())
                pathname += "index" + ext;
            // read file from file system
            fs.readFile(pathname, function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.end("Error getting the file: " + err + ".");
                }
                else {
                    // if the file is found, set Content-type and send data
                    res.setHeader("Content-type", map[ext] || "text/plain");
                    res.setHeader("Cache-Control", "max-age=3600");
                    res.end(data);
                }
            });
        }
    });
})
    .listen(port);
console.log("Server listening on port " + port);
