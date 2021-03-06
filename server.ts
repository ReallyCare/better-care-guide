const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const csp = require("node-csp");
const port = 3004;

const map = {
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
  ".doc": "application/msword",
};

const options = {
  directives: {
    defaultSrc: ["self"],
    styleSrc: ["self"],
    imgSrc: ["self"],
    fontSrc: ["self"],
    scriptSrc: ["self"],
  },
};

http
  .createServer(function (req, res) {
    console.log(`${req.method} ${req.url}`);

    // security headers
    csp.add(req, res, options);
    res.setHeader("Strict-Transport-Security", "max-age=15768000");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // parse URL
    const parsedUrl = url.parse(req.url);
    // extract URL path
    let pathname = `./public${parsedUrl.pathname}`;
    // don't let people get root access
    pathname = pathname.replace(/^(\.)+/, ".");
    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext || ".html";
    // maps file extention to MIME typere

    fs.access(pathname, function (err) {
      if (err) {
        res.writeHead(302, {
          Location: "/index.html",
        });
        res.end();
      } else {
        // if is a directory search for index file matching the extention
        if (fs.statSync(pathname).isDirectory()) pathname += "index" + ext;

        // read file from file system
        fs.readFile(pathname, function (err, data) {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
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

console.log(`Server listening on port ${port}`);
