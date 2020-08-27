let m = require("mithril");

let username;
let password;

let login = async () => {
    // Mission: to initialize state
    let state = {
        username: username,
        token: null,
        expires: null,
        CTLayers: null,
        CTIcons: null,
        CTConfigs: null,
        CTQml: null,
        layers: [],
    }
    
    // Step 1: get a token from ArcGIS
    let body = new FormData();
    body.append("referer", "https://www.arcgis.com");
    body.append("expiration", "280");
    body.append("f", "json");
    body.append("username", username);
    body.append("password", password);

    username = "";
    password = "";

    let response = await m.request({
        url: "https://www.arcgis.com/sharing/rest/generateToken",
        method: "POST",
        body: body,
    });

    if (response["error"]) {
        console.log(response)
        return;
    }

    state["token"] = response["token"];
    state["expires"] = response["expires"];

    // Step 2: get all the necessary project folder ids from ArcGIS
    response = await m.request({
        url: "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "?f=json&token=" + state["token"],
        method: "GET"
    })

    if (response["error"]) {
        console.log(response)
        return;
    }

    // These are the folders that we need ArcGIS to have
    const folders = ["CTLayers", "CTIcons", "CTConfigs", "CTQml"];

    for (let i = 0; i < response["folders"].length; i++) {
        let title = response["folders"][i]["title"];
        if (folders.includes(title)) {
            state[title] = response["folders"][i]["id"];
        }
    }

    // Step 3: if all the necessary project folders don't
    // exist create them and save their ids
    for (let i = 0; i < folders.length; i++) {
        let title = folders[i];
        if (state[title] === null) {
            body = new FormData();
            body.append("f", "json");
            body.append("token", state["token"]);
            body.append("title", title);

            response = await m.request({
                url: "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/createFolder",
                method: "POST",
                body: body
            })

            if (response["error"]) {
                console.log(response)
                return;
            }

            state[title] = response["folder"]["id"];
        }
    }

    sessionStorage.setItem("state", JSON.stringify(state));
    m.route.set("/home");
}

module.exports = {
    // If the user is already logged in then take them to the home page
    oninit: () => {
        const state = JSON.parse(sessionStorage.getItem("state"));
        const time = new Date();
        
        if (state !== null && state !== undefined && state["expires"] > time.getTime()) {
            m.route.set("/home");
        }        
    },

    view: () => {
        return m("div", [
            m("div", "Username"),
            m("input", {
                oninput: (e) => {
                    username = e.target.value;
                },
                value: username
            }),
            m("div", "Username"),
            m("input", {
                oninput: (e) => {
                    password = e.target.value;
                },
                value: password,
                type: "password"
            }),
            m("button", {
                onclick: () => {
                    login()
                }
            },"Login")
        ]);
    }
}