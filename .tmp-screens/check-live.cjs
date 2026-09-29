const fs = require("fs");
const html = fs.readFileSync(".tmp-screens/live-home.html", "utf8");
const checks = ["New in Belgium", "apollo", "Testimonial", "dpl_83bNV41sKx3JMiuBpf4noLKJzj2G"];
for (const item of checks) console.log(item, html.includes(item));
const canonical = html.match(/rel="canonical" href="[^"]+"/);
console.log(canonical ? canonical[0] : "no canonical");
