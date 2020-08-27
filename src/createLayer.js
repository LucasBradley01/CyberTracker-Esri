let m = require("mithril");

let config = {
    type: "FeatureCollection"
}

// Mission: create a layer on ArcGIS
async function createLayer(form) {
    const state = JSON.parse(sessionStorage.getItem("state"));
    
    // Step 1: Create a Feature Serviec on ArcGIS using their
    // REST API createService call
    let body = new FormData();
    body.append("token", state["token"]);
    body.append("f", "json");
    body.append("tags", "");
    body.append("typeKeywords", "ArcGIS Server,Data,Feature Access,Feature Service,Service,Hosted Service");
    body.append("outputType", "featureService");
    
    body.append("createParameters", JSON.stringify({
        "maxRecordCount": 2000,
        "supportedQueryFormats": "JSON",
        "capabilities": "Query,Editing,Create,Update,Delete,Extract",
        "description": form["description"],
        "allowGeometryUpdates": true,
        "hasStaticData": false,
        "units": "esriMeters",
        "syncEnabled": false,
        "editorTrackingInfo": {
            "enableEditorTracking": false,
            "enableOwnershipAccessControl": false,
            "allowOthersToQuery": true,
            "allowOthersToUpdate": true,
            "allowOthersToDelete": false,
            "allowAnonymousToUpdate": false,
            "allowAnonymousToDelete": false
        },
        "xssPreventionInfo": {
            "xssPreventionEnabled": true,
            "xssPreventionRule": "InputOnly",
            "xssInputRule": "rejectInvalid"
        },
        "initialExtent": {
            "xmin": -161.69675114151386,
            "ymin": -72.6726762942099,
            "xmax": 161.69675114151386,
            "ymax": 80.69452318405212,
            "spatialReference": {
                "wkid": 4326
            }
        },
        "spatialReference": {
            "wkid": 4326
        },
        "tables": [],
        "name": form["name"]
    }));

    let response = await m.request({
        url: "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTLayers"] + "/createService",
        method: "POST",
        body: body,
    })

    if (response["error"]) {
        console.log(response);
        return;
    }

    // Step 2: create a layer on top of the previously made feature service
    const serviceUrl = response["serviceurl"];
    const itemId = response["itemId"];

    let layer = {
        "layers": [
            {
                "adminLayerInfo":
                {
                    "geometryField": {
                        "name": "Shape",
                        "srid":4326
                    }
                },
                "name": form["name"],
                "type": "Feature Layer",
                "displayField": "",
                "description": form["description"],
                "copyrightText": "",
                "defaultVisibility": true,
                "relationships": [],
                "isDataVersioned": false,
                "supportsRollbackOnFailureParameter": true,
                "supportsAdvancedQueries": true,
                "geometryType": "esriGeometryPoint",
                "minScale": 0,
                "maxScale": 0,
                "extent": {
                    "xmin": -161.69675114151386,
                    "ymin": -72.6726762942099,
                    "xmax": 161.69675114151386,
                    "ymax": 80.69452318405212,
                    "spatialReference": {
                        "wkid":4326
                    }
                },
                "drawingInfo": {
                    "transparency": 0,
                    "labelingInfo": null,
                    "renderer": {
                        "type": "simple",
                        "symbol": {
                            "color": [20,158,206,130],
                            "size": 18,
                            "angle": 0,
                            "xoffset": 0,
                            "yoffset": 0,
                            "type": "esriSMS",
                            "style": "esriSMSCircle",
                            "outline": {
                                "color": [255,255,255,220],
                                "width": 2.25,
                                "type": "esriSLS",
                                "style": "esriSLSSolid"
                            }
                        }
                    }
                },
                "allowGeometryUpdates": true,
                "hasAttachments": true,
                "htmlPopupType": "esriServerHTMLPopupTypeNone",
                "hasM": false,
                "hasZ": false,
                "objectIdField": "OBJECTID",
                "globalIdField": "",
                "typeIdField": "",
                "fields": [
                    {
                        "name": "OBJECTID",
                        "type": "esriFieldTypeOID",
                        "alias": "OBJECTID",
                        "sqlType": "sqlTypeOther",
                        "nullable": false,
                        "editable": false,
                        "domain": null,
                        "defaultValue":null
                    },
                ],
                "indexes": [],
                "types": [],
                "templates": [
                    {
                        "name": "New Feature",
                        "description": "",
                        "drawingTool": "esriFeatureEditToolPoint",
                        "prototype": {
                            "attributes": {}
                        }
                    }
                ],
                "supportedQueryFormats": "JSON",
                "hasStaticData": true,
                "maxRecordCount": 10000,
                "capabilities": "Query"
            }
        ]
    };

    for (let i = 0; i < form["fields"].length; i++) {        
        let field = form["fields"][i];
        let squlType;
        let length = null;
        switch(field["type"]) {
            case "esriFieldTypeString":
                squlType = "sqlTypeNVarchar";
                length = 256;
                break;
            case "esriFieldTypeInteger":
                squlType = "sqlTypeInteger";
                break;
            default:
                squlType = "sqlTypeFloat";
        }

        let domain = null;
        if (field["code"].length > 0) {
            let codedValues = [];
            
            for (let j = 0; j < field["code"].length; j++) {
                let value = field["code"][j]["value"];
                codedValues.push({
                    name: value,
                    code: value
                })
            }

            domain = {
                type: "codedValue",
                codedValues: codedValues,
                name: field["name"]
            }
        }
        
        layer["layers"][0]["fields"].push({
            "name": field["name"],
            "type": field["type"],
            "alias": field["name"],
            "sqlType": squlType,
            "nullable": true,
            "editable": true,
            "domain": domain,
            "defaultValue": null,
            "length": length
        });

        layer["layers"][0]["templates"][0]["prototype"]["attributes"][form["fields"][i]["name"]] = null;
    }

    body = new FormData();
    body.append("token", state["token"]);
    body.append("f", "json");
    body.append("addToDefinition", JSON.stringify(layer));

    let baseUrl = serviceUrl + "/addToDefinition";
    let url = baseUrl.slice(0, 58) + "admin/" + baseUrl.slice(58);

    response = await m.request({
        url: url,
        method: "POST",
        body: body
    })

    if (response["error"]) {
        console.log(response);
        return;
    }

    body = new FormData();
    body.append("description", form["description"]);
    body.append("clearEmptyFields", "true");
    body.append("id", itemId);
    body.append("folderId", state["CTLayers"]);
    body.append("f", "json");
    body.append("token", state["token"]);    

    url = "https://test4859.maps.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTLayers"] + "/items/" + itemId + "/update";

    response = await m.request({
        url: url,
        method: "POST",
        body: body
    })

    if (response["error"]) {
        console.log(response);
        return;
    }
}

async function uploadIcons(name, img) {
    if (img === null) {
        return;
    }

    config[name] = img["name"];

    const state = JSON.parse(sessionStorage.getItem("state"));

    let body = new FormData();
    body.append("file", img);
    body.append("f", "json");
    body.append("token", state["token"]);
    body.append("title", img["name"]);

    let url = "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTIcons"] + "/addItem";

    let response = await m.request({
        url: url,
        method: "POST",
        body: body
    })

    if (response["error"]) {
        console.log(response);
        return;
    }
}

async function uploadConfigs(form) {
    const state = JSON.parse(sessionStorage.getItem("state"));

    let body = new FormData();
    body.append("file", config);
    body.append("f", "json");
    body.append("token", state["token"]);
    body.append("title", form["name"]);
    body.append("type", "GeoJson");

    let url = "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTConfigs"] + "/addItem";

    let response = await m.request({
        url: url,
        method: "POST",
        body: body
    })

    if (response["error"]) {
        console.log(response);
        return;
    }
}

module.exports = (formData) => {
    const form = formData;
    
    // Create Layer
    createLayer(form);

    // Upload Icons
    uploadIcons(form["name"], form["img"]);
    for (let i = 0; i < form["fields"].length; i++) {
        uploadIcons(form["fields"][i]["name"], form["fields"][i]["img"]);
        for (let j = 0; j < form["fields"][i]["code"].length; j++) {
            uploadIcons(form["fields"][i]["code"][j]["value"], form["fields"][i]["code"][j]["img"]);
        }
    }
    
    // Upload Configs
    uploadConfigs(form);
}