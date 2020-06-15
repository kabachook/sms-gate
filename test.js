const http = require("http");
const qs = require("querystring");

const EXAMPLE = qs.stringify({
  From: "+10001236565",
  To: "+11112345678",
  Body: "Test",
});

const req = http.request(
  {
    hostname: "localhost",
    port: 3000,
    path: "/sms",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(EXAMPLE),
    },
  },
  (res) => {
    console.log(res.statusCode);
    console.log(res.headers);
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      console.log(chunk);
    });
  }
);

req.on("error", (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(EXAMPLE);
req.end();
