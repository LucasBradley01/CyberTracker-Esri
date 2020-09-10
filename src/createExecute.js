let m = require("mithril");
let icons = new Set();

// Mission: create a layer on ArcGIS
async function createLayer(mtdt) {
    // Step 1: Create a Feature Serviec on ArcGIS using their
    // REST API createService call
    const state = JSON.parse(sessionStorage.getItem("state"));

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
        "description": mtdt[0]["description"],
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
        "name": mtdt[0]["name"]
    }));

    let response = await m.request({
        url: "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTLayers"] + "/createService",
        method: "POST",
        body: body,
    })

    if (response["error"]) {
        console.log(response);
        return response;
    }

    // Step 2: create a layer on top of the previously made feature service
    const serviceUrl = response["serviceurl"];
    const itemId = response["itemId"];

    let layer = {
        "layers": [{
            "adminLayerInfo": {
                "geometryField": {
                    "name": "Shape",
                    "srid":4326
                }
            },
            "name": mtdt[0]["name"],
            "type": "Feature Layer",
            "displayField": "",
            "description": mtdt[0]["description"],
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
                {
                    "name": "createTime",
                    "type": "esriFieldTypeDate",
                    "alias": "Create Time",
                    "sqlType": "sqlTypeTimestamp2",
                    "nullable": true,
                    "editable": true,
                    "domain": null,
                    "defaultValue": null,
                },
                {
                    "name": "updateTime",
                    "type": "esriFieldTypeDate",
                    "alias": "Update Time",
                    "sqlType": "sqlTypeTimestamp2",
                    "nullable": true,
                    "editable": true,
                    "domain": null,
                    "defaultValue": null,
                }
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
        }]
    };

    for (let i = 0; i < mtdt[0]["fields"].length; i++) {  
        let field = mtdt[0]["fields"][i];            
        let title = mtdt[0]["name"] + "/" + field["name"];  
        let length = null;
        let squlType;

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
        
        layer["layers"][0]["fields"].push({
            "name": title,
            "type": field["type"],
            "alias": field["name"],
            "sqlType": squlType,
            "nullable": true,
            "editable": true,
            "domain": null,
            "defaultValue": null,
            "length": length
        });

        layer["layers"][0]["templates"][0]["prototype"]["attributes"][title] = null;
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
        return response;
    }

    body = new FormData();
    body.append("description", mtdt[0]["description"]);
    body.append("clearEmptyFields", "true");
    body.append("id", itemId);
    body.append("folderId", state["CTLayers"]);
    body.append("f", "json");
    body.append("token", state["token"]);    

    url = "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTLayers"] + "/items/" + itemId + "/update";

    response = await m.request({
        url: url,
        method: "POST",
        body: body
    })

    if (response["error"]) {
        return response;
    }

    return {
        type: "createLayerResponse",
        url: serviceUrl,        
    };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function uploadIcon(icon) {
    if (icon === null || icons.has(icon["name"])) {
        return {
            type: "redundant"
        };
    }

    icons.add(icon["name"]);
    
    const state = JSON.parse(sessionStorage.getItem("state"));

    let body = new FormData();
    body.append("file", icon);
    body.append("f", "json");
    body.append("token", state["token"]);
    body.append("title", icon["name"]);

    let url = "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTIcons"] + "/addItem";

    let response = await m.request({
        url: url,
        method: "POST",
        body: body
    })

    if (response["error"]) {
        response["name"] = icon["name"];
        return response;
    }

    return {
        type: "uploadIconResponse",
        id: response["id"],
        name: icon["name"]
    };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function uploadMetadata(mtdt) {
    const metadataName = mtdt[0]["name"] + "_mtdt";
    
    const metadataFile = new File([
        JSON.stringify(mtdt)
    ], metadataName, {
        type: "application/json"
    });

    const state = JSON.parse(sessionStorage.getItem("state"));

    let body = new FormData();
    body.append("file", metadataFile);
    body.append("f", "json");
    body.append("token", state["token"]);
    body.append("title", metadataName);

    let url = "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTMetadata"] + "/addItem";

    let response = await m.request({
        url: url,
        method: "POST",
        body: body
    })

    if (response["error"]) {
        console.log(response);
        return response;
    }

    return response;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = async (mtdt) => {
    let promises = [];
    promises.push(createLayer(mtdt));
    promises.push(uploadIcon(mtdt[0]["icon"]));
    for (let i = 0; i < mtdt[0]["fields"].length; i++) {
        promises.push(uploadIcon(mtdt[0]["fields"][i]["icon"]));
        for (let j = 0; j < mtdt[0]["fields"][i]["list"].length; j++) {
            promises.push(uploadIcon(mtdt[0]["fields"][i]["list"][j]["icon"]));
        }
    }

    const state = JSON.parse(sessionStorage.getItem("state"));
    const CTIcons = await m.request({
        url: "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTIcons"] + "?f=json&token=" + state["token"],
        method: "GET"
    })

    const responses = await Promise.all(promises);
    for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        if (response["error"]) {
            if (response["error"]["code"] === 409) {                
                let item = CTIcons["items"].find((e) => {
                    return e["name"] = response["name"];
                })

                console.log(CTIcons);
                console.log(item);

                mtdt[0]["icons"].push({
                    name: item["name"],
                    id: item["id"]
                })
            }
            else {
                console.log(response);
            }
        }
        else if (response["type"] === "createLayerResponse") {
            mtdt[0]["url"] = response["url"];
        }
        else if (response["type"] === "uploadIconResponse") {
            mtdt[0]["icons"].push({
                name: response["name"],
                id: response["id"]
            })
        }
    }

    uploadMetadata(mtdt);
}