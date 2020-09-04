let m = require("mithril");
let createExecute = require("./createExecute");

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

// 0 48 -
// 9 57 
// A 65 -
// Z 90
// _ 95
// a 97 -
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

module.exports = {
    oninit: () => {
        const state = JSON.parse(sessionStorage.getItem("state"));
        const time = new Date();
        
        if (!state || state["expires"] < time.getTime()) {
            m.route.set("/login");
        }
    },

    view: () => {
        const state = JSON.parse(sessionStorage.getItem("state"));
        
        let formValid = true;

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
                class: "layer-name-element"
            }, [
                // Layer Name
                m("div"),
                m("div", "Layer Name"),
                m("div", "Layer Icon"),

                m("div"),
                m("input", {
                    oninput: (e) => {
                        form["name"] = e["target"]["value"];
                    },
                    value: form["name"],
                    class: (() => {
                        const nameInUse = state["layers"].find((layer) => {
                            return layer["title"] === form["name"];
                        });

                        if (form["name"] === null || nameInUse || !validChar(form["name"]) || form["name"] === "") {
                            return "invalid";
                        }

                        return "valid";
                    })()
                }),

                // Layer Icon
                m("input", {
                    type: "file",
                    oninput: (e) => {
                        form["img"] = e.target.files[0];
                    },
                    accept: "image/png, image/jpeg",
                    class: (() => {
                        if (form["img"] === null || form["img"]["type"] === "image/png" || form["img"]["type"] === "image/jpeg") {
                            return "valid";
                        }

                        formValid = false;
                        return "invalid";
                    })()
                }, "Browse"),


            ]),

            m("div", {
                class: "layer-info-element"
            }, [
                // Layer Info
                m("div"),
                m("div", "Layer Info"),
                m("div"),
                m("textarea", {
                    oninput: (e) => {
                        form["description"] = e.target.value;
                    },
                    value: form["description"],
                    class: "valid"
                })
            ]), 
            
            // Dynamic Fields Section
            m("div", [].concat(form["fields"].map((field, findex) => {
                return [
                    m("div", {
                        class: "field-section"
                    }, [
                        // Static Field Section
                        m("div", {
                            class: "field-meta-section"
                        }, [   
                            // Field Name                     
                            m("div", "Field Name"),
                            m("input", {
                                oninput: (e) => {
                                    field["name"] = e["target"]["value"];
                                },
                                value: field["name"],
                                class: (() => {
                                    let valid = true;
                                    if (field["name"] === "" || field["name"] === null || !validChar(field["name"])) {
                                        valid = false;
                                    }
                                    else {
                                        for (let i = 0; i < form["fields"].length; i++) {
                                            if (i === findex) {
                                                continue;
                                            }
        
                                            if (form["fields"][i]["name"] === field["name"]) {
                                                valid = false;
                                            }
                                        }
                                    }
    
                                    if (valid) {
                                        return "valid";
                                    }
    
                                    formValid = false;
                                    return "invalid";
                                })()
                            }),
    
                            // Field Type
                            m("div", "Field Type"),
                            m("select", {
                                oninput: (e) => {
                                    field["type"] = e.target.value
                                },
                                value: field["type"],
                                class: (() => {
                                    if (field["type"] === null) {
                                        formValid = false;
                                        return "invalid";
                                    }

                                    return "valid";
                                })()
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
                                accept: "image/png, image/jpeg",
                                class: (() => {
                                    if (field["img"] === null || field["img"]["type"] === "image/png" || field["img"]["type"] === "image/jpeg") {
                                        return "valid";
                                    }
            
                                    formValid = false;
                                    return "invalid";
                                })()
                            }, "Browse"),
                        ]),
    
                        // Dynamic Code Section
                        m("div", [
                            
                        ].concat(field["code"].map((item, cindex) => {
                            return m("div", {
                                class: "code-section"
                            }, [
                                // Code Value
                                m("div", "List Value"),
                                m("input", {
                                    oninput: (e) => {
                                        form["fields"][findex]["code"][cindex]["value"] = e["target"]["value"];
                                    },
                                    class: (() => {
                                        let valid = true;
                                        if (item["value"] === "" || item["value"] === null || !validChar(item["value"])) {
                                            valid = false;
                                        }
                                        else {
                                            for (let i = 0; i < field["code"].length; i++) {
                                                if (i === cindex) {
                                                    continue;
                                                }
            
                                                if (field["code"][i]["value"] === item["value"]) {
                                                    valid = false;
                                                }
                                            }
                                        }
        
                                        if (valid) {
                                            return "valid";
                                        }
        
                                        formValid = false;
                                        return "invalid";
                                    })()
                                }),
    
                                // Delete Code Button
                                m("button", {
                                    onclick: () => {
                                        form["fields"][findex]["code"].splice(cindex, 1);
                                    }
                                }, "Delete"),
    
                                // Code Image
                                m("div", "List Image"),
                                m("input", {
                                    type: "file",
                                    oninput: (e) => {
                                        item["img"] = e.target.files[0];
                                    },
                                    accept: "image/png, image/jpeg",
                                    class: (() => {
                                        if (item["img"] === null || item["img"]["type"] === "image/png" || field["img"]["type"] === "image/jpeg") {
                                            return "valid";
                                        }
                
                                        formValid = false;
                                        return "invalid";
                                    })()
                                })
                            ])
                        }))),
    
                        // Static Field Foot Section
                        m("div", {
                            class: "field-foot-section"
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
            }))),

            // Static Form Footer Section
            m("div", {
                class: "form-foot-section"
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
                        if (formValid) {
                            createExecute(form);
                        }
                        else {
                            alert("Invalid Input")
                        }
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