let m = require("mithril");
const state = JSON.parse(sessionStorage.getItem("state"));

// Mission: create a layer on ArcGIS
async function createLayer(form) {
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

    for (let i = 0; i < form["fields"].length; i++) {  
        let field = form["fields"][i];            
        let title = form["name"] + "/" + field["name"];  
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
    body.append("description", form["description"]);
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
        console.log(response);
        return response;
    }

    return {
        type: "createLayerResponse",
        url: serviceUrl,        
        uid: form["name"]
    };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function uploadIcon(uid, img) {
    if (img === null) {
        return {
            error: "No icon chosen"
        };
    }
    
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
        return response;
    }

    return {
        type: "uploadIconResponse",
        id: response["id"],
        uid: uid
    };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function uploadMetadata(layerMetadata) {
    const metadataName = layerMetadata["layers"][0]["name"] + "/" + "Metadata";
    
    const metadataFile = new File([
        JSON.stringify(layerMetadata)
    ], metadataName, {
        type: "application/json"
    });

    let body = new FormData();
    body.append("file", metadataFile);
    body.append("f", "json");
    body.append("token", state["token"]);
    body.append("title", metadataName);
    body.append("type", "GeoJson");

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

// Mission: create a feature layer, upload all the icons which correspond to the layer, fields, or list items of
// said feature layer, construct a json object which keeps track of all relevant layer information for
// the cyber tracker data capture application, and finally upload that file.
module.exports = async (form) => {
    // To create the metadata json file we must collect the id's and urls returned by all the uploads and
    // service creations. We collect them as promises in an array aptly named promises
    let promises = [];

    // Section 1: make all necessary http requests and push them to the promises array and build up the
    // metadata json object
    promises.push(createLayer(form));

    let layerMetadata = {
        "type": "FeatureCollection",
        "layers": [{
            "uid": form["name"],
            "name": form["name"],
            "icon": form["img"] === null ? null : form["img"]["name"],
            "iconId": null,
            "url": null,
            "fields": []
        }]
    }

    promises.push(uploadIcon(form["name"], form["img"]));

    for (let i = 0; i < form["fields"].length; i++) {
        const field = form["fields"][i];
        const fieldName = field["name"];
        const fieldUid = form["name"] + "/" + fieldName;

        // We need fieldIndex to access this element later, push returns
        // the length, we need the last element, thus the (-1)
        const fieldIndex = (-1) + layerMetadata["layers"][0]["fields"].push({
            "uid": fieldUid,
            "name": fieldName,
            "type": field["type"],
            "iconName": field["img"] === null ? null : field["img"]["name"],
            "iconId": null
        });

        promises.push(uploadIcon(fieldUid, field["img"]));

        if (field["code"].length > 0) {
            layerMetadata["layers"][0]["fields"][fieldIndex]["list"] = [];
            for (let j = 0; j < field["code"].length; j++) {
                const item = field["code"][j];
                const itemUid = fieldUid + "/" + item["name"];

                layerMetadata["layers"][0]["fields"][fieldIndex]["list"].push({
                    "uid": itemUid,
                    "name": item["name"],
                    "iconName": item["img"] === null ? null : item["img"]["name"],
                    "iconId": null
                })

                promises.push(uploadIcon(itemUid, item["img"]));
            }
        }
    }

    const responses = await Promise.all(promises);
    
    // Section 2: based upon the responses fill in the icondId's and the url of the
    // metadata object
    for (let i = 0; i < responses.length; i++) {        
        const response = responses[i];
        if (response["error"]) {
            console.log(response);
            continue;
        }
        
        if (response["type"] === "createLayerResponse") {
            layerMetadata["layers"][0]["url"] = response["url"];
        }
        else if (response["type"] === "uploadIconResponse") {
            const uid = response["uid"];
            // The uid of every element is based upon the hierarchy of the layer,
            // field, and list item. So we can 
            const splitUid = uid.split("/");
            
            if (splitUid.length === 3) {
                const fields = layerMetadata["layers"][0]["fields"];
                const fieldIndex = fields.findIndex((field) => {
                    return field["name"] === splitUid[1];
                });

                const itemIndex = fields[fieldIndex]["list"].findIndex((item) => {
                    return item["uid"] === uid;
                });

                layerMetadata["layers"][0]["fields"][fieldIndex]["list"][itemIndex]["iconId"] = response["id"];
            }
            else if (splitUid.length === 2) {
                const fields = layerMetadata["layers"][0]["fields"];
                const fieldIndex = fields.findIndex((field) => {
                    return field["uid"] === uid;
                });
                
                layerMetadata["layers"][0]["fields"][fieldIndex]["iconId"] = response["id"];
            }
            else if (splitUid.length === 1) {
                layerMetadata["layers"][0]["iconId"] = response["id"];
            }
        }
    }

    uploadMetadata(layerMetadata);
}