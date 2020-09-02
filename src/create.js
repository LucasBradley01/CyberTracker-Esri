let m = require("mithril");
let createLayer = require("./createLayer");

let form = {
    name: null,
    img: null,
    description: null,
    fields: [{
        name: null,
        type: null,
        img: null,
        code: [],
    }],
}

let fields = {
    view: () => {
        return [].concat(form["fields"].map((field, findex) => {
            return [
                m("div", {
                    id: "field-section"
                }, [
                    m("div", {
                        id: "field-meta-section"
                    }, [                        
                        m("div", "Field Name"),
                        m("input", {
                            oninput: (e) => {
                                field["name"] = e.target.value
                            },
                            value: field["name"]
                        }),
                        m("div", "Field Type"),
                        m("select", {
                            oninput: (e) => {
                                field["type"] = e.target.value
                            },
                            value: field["type"]
                        }, [
                            m("option", {
                                value: "esriFieldTypeString"
                            }, "String"),
                            m("option", {
                                value: "esriFieldTypeInteger"
                            }, "Integer"),
                            m("option", {
                                value: "esriFieldTypeDouble"
                            }, "Double")
                        ]),
                        m("div", "Field Icon"),
                        m("input", {
                            type: "file",
                            oninput: (e) => {
                                field["img"] = e.target.files[0];
                            },
                            accept: "image/png, image/jpeg"
                        }, "Browse"),
                    ]),

                    m("div", [].concat(form["fields"][findex]["code"].map((code, cindex) => {
                        return m("div", {
                            id: "code-section"
                        }, [
                            m("div", "Code Value"),
                            m("input", {
                                oninput: (e) => {
                                    code["value"] = e.target.value;
                                }
                            }),
                            m("button", {
                                onclick: () => {
                                    form["fields"][findex]["code"].splice(cindex, 1);
                                }
                            }, "Delete Code"),
                            m("div", "Code Image"),
                            m("input", {
                                type: "file",
                                oninput: (e) => {
                                    code["img"] = e.target.files[0];
                                },
                                accept: "image/png, image/jpeg"
                            })
                        ])
                    }))),

                    m("div", {
                        id: "field-foot-section"
                    }, [
                        m("button", {
                            onclick: () => {
                                field.code.push({
                                    value: null,
                                    img: null
                                });
                            }
                        }, "Add Code"),
                        m("div"),
                        m("button", {
                            onclick: () => {
                                form["fields"].splice(findex, 1);
                            }
                        }, "Delete Field")
                    ])
                ]),
            ]
        }))
    }
}

module.exports = {
    oninit: () => {
        const state = JSON.parse(sessionStorage.getItem("state"));
        const time = new Date();
        
        if (state === null || state === undefined || state["expires"] < time.getTime()) {
            m.route.set("/login");
        }
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
                        m.route.set("/home");
                    }
                }, "Home"),
                m("div", {
                    class: "header"
                }, "Create a New Layer"),
                m("button", {
                    onclick: () => {
                        sessionStorage.setItem("state", null);
                        m.route.set("/login");
                    }
                }, "Logout"),
            ]),
            
            m("div", {
                id: "layer-name-element"
            }, [
                m("div", "Layer Name"),
                m("input", {
                    oninput: (e) => {
                        form["name"] = e.target.value;
                    },
                    value: form["name"]
                }),
                m("div", "Layer Icon"),
                m("input", {
                    type: "file",
                    oninput: (e) => {
                        form["img"] = e.target.files[0];
                    },
                    accept: "image/png, image/jpeg"
                }, "Browse"),
                m("div", "Layer Info"),
                m("textarea", {
                    oninput: (e) => {
                        form["description"] = e.target.value;
                    },
                    value: form["description"]
                })
            ]),
            
            
            m(fields),

            m("div", {
                id: "form-foot-section"
            }, [
                m("button", {
                    onclick: () => {
                        form["fields"].push({
                            name: null,
                            type: null,
                            img: null,
                            code: []
                        });
                    }
                }, "Add Field"),
                m("button", {
                    onclick: () => {
                        createLayer(form);
                    }
                }, "Create New Layer"),
                m("button", {
                    onclick: () => {
                        form = {
                            name: null,
                            img: null,
                            description: null,
                            fields: [{
                                name: null,
                                type: null,
                                img: null,
                                code: [],
                            }],
                        }
                    }
                }, "Delete All"),
            ])
        ])
    }
}