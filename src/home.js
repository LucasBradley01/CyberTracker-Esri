let m = require("mithril");

let layers = [];
let search = "";

let load = async () => {
    let state = JSON.parse(sessionStorage.getItem("state"));

    let response = await m.request({
        url: "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTLayers"] + "?f=json&token=" + state["token"],
        method: "GET"
    })

    if (response["error"]) {
        console.log(response)
        return;
    }

    state["layers"] = response["items"].map((item) => {
        return test = {
            title: item["title"],
            url: item["url"],
            description: item["description"]
        };
    })
    sessionStorage.setItem("state", JSON.stringify(state));
    layers = state["layers"];
}

module.exports = {
    oninit: () => {
        const state = JSON.parse(sessionStorage.getItem("state"));
        const time = new Date();
        
        if (state === null || state === undefined || state["expires"] < time.getTime()) {
            m.route.set("/login");
        }

        layers = state["layers"];
        load();
    },
    
    view: () => {
        return m("div", {
            class: "root"
        }, [
            m("div", {
                class: "head"
            }, [
                m("button", {
                    onclick: () => {
                        m.route.set("/create");
                    }
                }, "Create Layer"),
                m("div", {
                    class: "header"
                }, "Home"),
                m("button", {
                    onclick: () => {
                        sessionStorage.setItem("state", null);
                        m.route.set("/login");
                    }
                }, "Logout"),
            ]),

            m("div", {
                id: "layer-list"
            }, [
                m("div", {
                    id: "layer-list-search"
                }, [
                    m("div", "Search"),
                    m("div", {
                        id: "left-ten",
                    }, [
                        m("input", {
                            oninput: (e) => {
                                search = e.target.value;
                            },
                            value: search
                        })
                    ]),
                    m("button", {
                        onclick: () => {
                            search = "";
                        }
                    }, "Clear"),
                ]),
                m("div", {
                    id: "layer-list-header"
                }, [
                    m("div", "Layers"),
                    m("div", {
                        id: "left-ten"
                    }, "Description")
                ]),

            ].concat(layers.map((item, index) => {
                let desc = item["description"];
                if (desc === null) {
                    desc = "No description";
                }

                if (!item["title"].toLowerCase().includes(search.toLowerCase()) &&
                    !desc.toLowerCase().includes(search.toLowerCase())) {
                    return;
                }
                
                return m("div", {
                    id: "layer-list-entry"
                }, [
                    m(m.route.Link, {
                        href: "/layer/" + index
                    }, item["title"]),
                    m("div", {
                        id: "left-ten"
                    }, desc)
                ]);
            }))),
        ]);
    }
}