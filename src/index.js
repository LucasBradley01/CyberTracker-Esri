let m = require("mithril");
let login = require("./login.js");
let home = require("./home.js");
let create = require("./create.js");
let projectCreator = require("./projectCreator.js");

m.route(document.body, "/login", {
    "/login": login,
    "/home": home,
    "/create": create,
    "/projectCreator": projectCreator
})