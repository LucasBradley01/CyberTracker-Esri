let m = require("mithril");
let createExecute = require("./createExecute");

let mtdt = [{
    url: "",
    uid: "",
    name: "",
    icon: null,
    iconName: "qrc:/Esri/logo.png",
    description: "",
    fields: [{
        uid: "",
        name: "",
        icon: null,
        iconName: "qrc:/Esri/logo.png",
        type: "",
        list: [],
    }]
}]

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
                        mtdt[0]["name"] = e["target"]["value"];
                        mtdt[0]["uid"] = mtdt[0]["name"];
                    },
                    value: mtdt[0]["name"],
                    class: (() => {
                        const nameInUse = state["layers"].find((layer) => {
                            return layer["title"] === mtdt[0]["name"];
                        });

                        if (mtdt[0]["name"] === {} || nameInUse || !validChar(mtdt[0]["name"]) || mtdt[0]["name"] === "") {
                            return "invalid";
                        }

                        return "valid";
                    })()
                }),

                // Layer Icon
                m("input", {
                    type: "file",
                    oninput: (e) => {
                        mtdt[0]["icon"] = e["target"]["files"][0];
                        mtdt[0]["iconName"] = mtdt[0]["icon"]["name"];
                    },
                    accept: "image/png, image/jpeg",
                    class: (() => {
                        if (mtdt[0]["icon"] === null || mtdt[0]["icon"]["type"] === "image/png" || mtdt[0]["icon"]["type"] === "image/jpeg") {
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
                        mtdt[0]["description"] = e.target.value;
                    },
                    value: mtdt[0]["description"],
                    class: "valid"
                })
            ]), 
            
            // Dynamic Fields Section
            m("div", [].concat(mtdt[0]["fields"].map((field, findex) => {
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
                                    field["uid"] = mtdt[0]["name"] + "/" + field["name"];
                                },
                                value: field["name"],
                                class: (() => {
                                    let valid = true;
                                    if (field["name"] === "" || !validChar(field["name"])) {
                                        valid = false;
                                    }
                                    else {
                                        for (let i = 0; i < mtdt[0]["fields"].length; i++) {
                                            if (i === findex) {
                                                continue;
                                            }
        
                                            if (mtdt[0]["fields"][i]["name"] === field["name"]) {
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
                                    field["type"] = e["target"]["value"];
                                },
                                value: field["type"],
                                class: (() => {
                                    if (field["type"] === "") {
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
                                    field["icon"] = e["target"]["files"][0];
                                    field["iconName"] = field["icon"]["name"];
                                },
                                accept: "image/png, image/jpeg",
                                class: (() => {
                                    if (field["icon"] === null || field["icon"]["type"] === "image/png" || field["icon"]["type"] === "image/jpeg") {
                                        return "valid";
                                    }
            
                                    formValid = false;
                                    return "invalid";
                                })()
                            }, "Browse"),
                        ]),
    
                        // Dynamic Code Section
                        m("div", [
                            
                        ].concat(field["list"].map((item, cindex) => {
                            return m("div", {
                                class: "code-section"
                            }, [
                                // Code Value
                                m("div", "List Value"),
                                m("input", {
                                    oninput: (e) => {
                                        item["name"] = e["target"]["value"];
                                        item["uid"] = mtdt[0]["name"] + "/" + field["name"] + "/" + item["name"];
                                    },
                                    class: (() => {
                                        let valid = true;
                                        if (item["name"] === "" || !validChar(item["name"])) {
                                            valid = false;
                                        }
                                        else {
                                            for (let i = 0; i < field["list"].length; i++) {
                                                if (i === cindex) {
                                                    continue;
                                                }
            
                                                if (field["list"][i]["name"] === item["name"]) {
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
                                        mtdt[0]["fields"][findex]["list"].splice(cindex, 1);
                                    }
                                }, "Delete"),
    
                                // Code Image
                                m("div", "List Image"),
                                m("input", {
                                    type: "file",
                                    oninput: (e) => {
                                        item["icon"] = e["target"]["files"][0];
                                        item["iconName"] = item["icon"]["name"];
                                    },
                                    accept: "image/png, image/jpeg",
                                    class: (() => {
                                        if (item["icon"] === null || item["icon"]["type"] === "image/png" || field["icon"]["type"] === "image/jpeg") {
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
                                    field["list"].push({
                                        uid: "",
                                        name: "",
                                        icon: null,
                                    });
                                }
                            }, "Add Item"),
                            m("div"),
    
                            // Delete Field Button
                            m("button", {
                                onclick: () => {
                                    mtdt[0]["fields"].splice(findex, 1);
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
                        mtdt[0]["fields"].push({
                            uid: "",
                            name: "",
                            icon: null,
                            iconName: "qrc:/Esri/logo.png",
                            type: "",
                            list: [],
                        });
                    }
                }, "Add Field"),

                // Submit / Create New Layer Button
                m("button", {
                    onclick: () => {
                        if (true || formValid) {
                            createExecute(mtdt);
                        }
                        else {
                            alert("Invalid Input")
                        }
                    }
                }, "Create New Layer"),

                // Reset Form Button
                m("button", {
                    onclick: () => {
                        mtdt = [{
                            url: "",
                            uid: "",
                            name: "",
                            icon: null,
                            iconName: "qrc:/Esri/logo.png",
                            description: "",
                            fields: [{
                                uid: "",
                                name: "",
                                icon: null,
                                iconName: "qrc:/Esri/logo.png",
                                type: "",
                                list: [],
                            }]
                        }]
                    }
                }, "Delete All"),
            ])
        ])
    }
}