const { file } = require("jszip");
let m = require("mithril");

let mtdt = [{
    url: "",
    uid: "",
    name: "",
    icon: null,
    iconName: "qrc:/Esri/logo.png",
    fields: [{
        uid: "",
        name: "",
        icon: null,
        iconName: "qrc:/Esri/logo.png",
        type: "",
        list: [],
    }]
}]

module.exports = {
    oninit: () => {
        const state = JSON.parse(sessionStorage.getItem("state"));
        const time = new Date();
        
        if (!state || state["expires"] < time.getTime()) {
            m.route.set("/login");
        }
    },

    view: () => {
        return m("div", {
            id: "pc-root"
        }, [
            m("div", {
                id: "pc-header"
            }, [
                m("button", {
                    onclick: (e) => {

                    }
                }, "Home"),
                m("div", {
                    class: "header"
                }, "Project Creator"),
                m("button", {
                    onclick: (e) => {

                    }
                }, "Logout")
            ]),

            m("div", [].concat(mtdt.map((item, index) => {
                return m("div", {
                    id: "pc-form"
                }, [
                    m("div", {
                        id: "pc-form-static"
                    }, [
                        m("div", "Layer Name"),
                        m("div", "Layer Icon"),
                        m("input", {
                            oninput: (e) => {

                            }
                        }),
                        m("input", {
                            type: "file",
                            oninput: (e) => {

                            }
                        })
                    ])
                ])
            })))


        ])
    }
}