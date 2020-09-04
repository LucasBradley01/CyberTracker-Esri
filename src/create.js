let m = require("mithril");
let createExecute = require("./createExecute");
const state = JSON.parse(sessionStorage.getItem("state"));

let invalids = 0;

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

// 0 48
// 9 57 
// A 65
// Z 90
// _ 95
// a 97
// z 122

function validChar(str) {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if ((code < 48 || code > 57) && (code < 65 || code > 90) && (code < 97 || code > 122) && (code != 95)) {
            return false;
        }
    }
    return true;
}


// Page Fields Section
let fields = {
    view: () => {
        return [].concat(form["fields"].map((field, findex) => {
            return [
                m("div", {
                    id: "field-section"
                }, [
                    // Static Field Section
                    m("div", {
                        id: "field-meta-section"
                    }, [   
                        // Field Name                     
                        m("div", "Field Name"),
                        m("input", {
                            oninput: (e) => {
                                field["name"] = e["target"]["value"];

                                let nameAvailable = true;
                                if (field["name"] !== "") {
                                    for (let i = 0; i < form["fields"].length; i++) {
                                        if (i === findex) {
                                            continue;
                                        }
    
                                        if (form["fields"][i]["name"] === field["name"]) {
                                            nameAvailable = false;
                                            break;
                                        }
                                    }
                                }

                                if (!nameAvailable || !validChar(field["name"]) || field["name"] === "") {
                                    e["target"]["id"] = "invalid";
                                }
                                else {
                                    e["target"]["id"] = "valid";
                                }
                            },
                            value: field["name"]
                        }),

                        // Field Type
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

                        // Field Icon
                        m("div", "Field Icon"),
                        m("input", {
                            type: "file",
                            oninput: (e) => {
                                field["img"] = e.target.files[0];
                            },
                            accept: "image/png, image/jpeg"
                        }, "Browse"),
                    ]),

                    // Dynamic Code Section
                    m("div", [].concat(field["code"].map((item, cindex) => {
                        return m("div", {
                            id: "code-section"
                        }, [
                            // Code Value
                            m("div", "Code Value"),
                            m("input", {
                                oninput: (e) => {
                                    item["name"] = e["target"]["value"];

                                    let nameAvailable = true;
                                    if (item["name"] !== "") {
                                        for (let i = 0; i < field["code"].length; i++) {
                                            if (i === cindex) {
                                                continue;
                                            }
        
                                            if (field["code"][i]["name"] === item["name"]) {
                                                nameAvailable = false;
                                                break;
                                            }
                                        }
                                    }
    
                                    if (!nameAvailable || !validChar(item["name"])) {
                                        e["target"]["id"] = "invalid";
                                    }
                                    else {
                                        e["target"]["id"] = "valid";
                                    }
                                }
                            }),

                            // Delete Code Button
                            m("button", {
                                onclick: () => {
                                    form["fields"][findex]["code"].splice(cindex, 1);
                                }
                            }, "Delete Code"),

                            // Code Image
                            m("div", "Code Image"),
                            m("input", {
                                type: "file",
                                oninput: (e) => {
                                    item["img"] = e.target.files[0];
                                },
                                accept: "image/png, image/jpeg"
                            })
                        ])
                    }))),

                    // Static Field Foot Section
                    m("div", {
                        id: "field-foot-section"
                    }, [
                        // Add Code
                        m("button", {
                            onclick: () => {
                                field.code.push({
                                    value: null,
                                    img: null
                                });
                            }
                        }, "Add Code"),
                        m("div"),

                        // Delete Field Button
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
        
        if (!state || state["expires"] < time.getTime()) {
            m.route.set("/login");
        }
    },

    view: () => {
        return m("div", {
            class: "root"
        }, [
            // Banner / Head
            m("div", {
                class: "head"
            }, [
                // Home Button
                m("button", {
                    onclick: () => {
                        m.route.set("/home");
                    }
                }, "Home"),

                // Page Title
                m("div", {
                    class: "header"
                }, "Create a New Layer"),

                // Logout Button
                m("button", {
                    onclick: () => {
                        sessionStorage.setItem("state", null);
                        m.route.set("/login");
                    }
                }, "Logout"),
            ]),
            
            // Static Layer Name Section
            m("div", {
                id: "layer-name-element"
            }, [
                // Layer Name
                m("div", "Layer Name"),
                m("input", {
                    oninput: (e) => {
                        form["name"] = e["target"]["value"];

                        const nameInUse = state["layers"].find((layer) => {
                            return layer["title"] === e.target.value;
                        });

                        if (nameInUse || !validChar(form["name"])) {
                            e["target"]["id"] = "invalid";
                        }
                        else {
                            e["target"]["id"] = "valid";
                        }
                    },
                    value: form["name"],
                    onfocusout: (e) => {

                    }
                }),

                // Layer Icon
                m("div", "Layer Icon"),
                m("input", {
                    type: "file",
                    oninput: (e) => {
                        form["img"] = e.target.files[0];
                    },
                    accept: "image/png, image/jpeg"
                }, "Browse"),

                // Layer Info
                m("div", "Layer Info"),
                m("textarea", {
                    oninput: (e) => {
                        form["description"] = e.target.value;
                    },
                    value: form["description"]
                })
            ]),
            
            // Dynamic Fields Section
            m(fields),

            // Static Form Footer Section
            m("div", {
                id: "form-foot-section"
            }, [
                // Add Field Button
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

                // Submit / Create New Layer Button
                m("button", {
                    onclick: () => {
                        createExecute(form);
                    }
                }, "Create New Layer"),

                // Reset Form Button
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