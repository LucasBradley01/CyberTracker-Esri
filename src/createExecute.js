const m = require("mithril");
const JSZip = require("jszip");

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
        "capabilities": "Query",
        "description": "",
        "allowGeometryUpdates": true,
        "hasStaticData": true,
        "units": "esriMeters",
        "syncEnabled": false,
        "editorTrackingInfo": {
            "enableEditorTracking": false,
            "enableOwnershipAccessControl": false,
            "allowOthersToQuery": true,
            "allowOthersToUpdate": true,
            "allowOthersToDelete": false,
            "allowAnonymousToUpdate": true,
            "allowAnonymousToDelete": true
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
        url: "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/createService",
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
            "adminLayerInfo":
            {
                "geometryField": {
                    "name": "Shape",
                    "srid":4326
                }
            },
            "name": mtdt[0]["name"],
            "type": "Feature Layer",
            "displayField": "",
            "description": "",
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
        ///let title = mtdt[0]["name"] + "/" + field["name"];  
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
            "name": field["name"],
            "type": field["type"],
            "alias": field["name"],
            "sqlType": squlType,
            "nullable": true,
            "editable": true,
            "domain": null,
            "defaultValue": null,
            "length": length
        });

        layer["layers"][0]["templates"][0]["prototype"]["attributes"][field["name"]] = null;
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
    body.append("token", state["token"]);
    body.append("f", "json");
    body.append("updateDefinition", JSON.stringify({
        "hasStaticData": false,
        "capabilities": "Query,Editing,Create,Update,Delete,Extract",
        "allowGeometryUpdates": true,
        "editorTrackingInfo": {
            "enableEditorTracking": false,
            "enableOwnershipAccessControl": false,
            "allowOthersToUpdate": true,
            "allowOthersToDelete": true,
            "allowOthersToQuery": true,
            "allowAnonymousToUpdate": true,
            "allowAnonymousToDelete":true
        }
    }))

    baseUrl = serviceUrl + "/updateDefinition";
    url = baseUrl.slice(0, 58) + "admin/" + baseUrl.slice(58);

    response = await         m.request({
        url: url,
        method: "POST",
        body: body, 
    });

    if (response["error"]) {
        console.log(response);
        return response;
    }

    return {
        type: "createLayerResponse",
        url: serviceUrl,        
    };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function uploadZip(zipFilename, zip) {
    const state = JSON.parse(sessionStorage.getItem("state"));

    const zipBlob = await zip.generateAsync({
        type: "blob"
    });

    const zipFile = new File([
        zipBlob
    ], zipFilename, {
        type: "application/zip"
    })

    let body = new FormData();
    body.append("file", zipFile);
    body.append("f", "json");
    body.append("token", state["token"]);
    body.append("title", zipFilename);

    let url = "https://www.arcgis.com/sharing/rest/content/users/" + state["username"] + "/" + state["CTProjects"] + "/addItem";

    response = await m.request({
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

function createelementsQml(mtdt) {
    let elementsQml = "import CyberTracker 1.0\n\n";

    elementsQml += ("Element {\n");

    // Build up the layers top section
    elementsQml += ("    Element {\n");
    elementsQml += ("        uid: \"layers\"\n");
    elementsQml += ("        name: \"layers\"\n");

    for (let i = 0; i < mtdt.length; i++) {
        // fieldUids is a list of all the uids this element uses,
        // photos and location are on by default
        let fieldUids = "[\"__photos\", \"__location\"";
        for (let j = 0; j < mtdt[i]["fields"].length; j++) {
            fieldUids += (", \"" + mtdt[i]["fields"][j]["uid"] + "\"");
        }
        fieldUids += ("]");
        
        // Create an element for every layer
        elementsQml += ("        Element {\n");
        elementsQml += ("            uid: \"" + mtdt[i]["uid"] + "\"\n");
        elementsQml += ("            name: \"" + mtdt[i]["name"] + "\"\n");
        elementsQml += ("            icon: \"" + mtdt[i]["iconName"] + "\"\n");
        elementsQml += ("            fieldUids: " + fieldUids + "\n");
        elementsQml += ("        }\n");
    }

    elementsQml += ("    }\n");

    // Append all of the fields
    elementsQml += ("    Element {\n");
    elementsQml += ("        uid: \"__location\"\n");
    elementsQml += ("    }\n");
    elementsQml += ("    Element {\n");
    elementsQml += ("        uid: \"__photos\"\n");
    elementsQml += ("    }\n");
    
    for (let i = 0; i < mtdt.length; i++) {
        for (let j = 0; j < mtdt[i]["fields"].length; j++) {
            let field = mtdt[i]["fields"][j];
            elementsQml += ("    Element {\n");
            elementsQml += ("        uid: \"" + field["uid"] + "\"\n");
            elementsQml += ("        name: \"" + field["name"] + "\"\n");
            elementsQml += ("        icon: \"" + field["iconName"] + "\"\n");
            for (let k = 0; k < field["list"].length; k++) {
                let item = field["list"][k];
                elementsQml += ("        Element {\n");
                elementsQml += ("            uid: \"" + item["uid"] + "\"\n");
                elementsQml += ("            name: \"" + item["name"] + "\"\n");
                elementsQml += ("            icon: \"" + item["iconName"] + "\"\n");
                elementsQml += ("        }\n");
            }
            elementsQml += ("    }\n");
        }
    }

    elementsQml  += ("}")

    return elementsQmlFile = new File([
        elementsQml
    ], "Elements.qml", {
        type: "text/plain"
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createFieldsQml(mtdt) {
    let fieldsQml = "import CyberTracker 1.0\n\n"

    fieldsQml += ("RecordField {\n");
    fieldsQml += ("    LocationField {\n");
    fieldsQml += ("        uid: \"__location\"\n");
    fieldsQml += ("        nameElementUid: \"Location\"\n");
    fieldsQml += ("        required: true\n");
    fieldsQml += ("    }\n");
    fieldsQml += ("    PhotoField {\n");
    fieldsQml += ("        uid: \"__photos\"\n");
    fieldsQml += ("        nameElementUid: \"Photos\"\n");
    fieldsQml += ("        maxCount: 16\n");
    fieldsQml += ("    }\n");
    fieldsQml += ("    StringField {\n");
    fieldsQml += ("        uid: \"reportUid\"\n");
    fieldsQml += ("        nameElementUid: \"layers\"\n");
    fieldsQml += ("        listElementUid: \"layers\"\n");
    fieldsQml += ("    }\n");

    for (let i = 0; i < mtdt.length; i++) {
        for (let j = 0; j < mtdt[i]["fields"].length; j++) {
            let field = mtdt[i]["fields"][j];
            if (field["type"] === "esriFieldTypeString") {
                fieldsQml += ("    StringField {\n");
                fieldsQml += ("        uid: \"" + field["uid"] + "\"\n");
                fieldsQml += ("        nameElementUid: \"" + field["uid"] + "\"\n");
                if (field["list"].length > 0) fieldsQml += ("        listElementUid: \"" + field["uid"] + "\"\n");
                fieldsQml += ("        exportUid: \"" + field["name"] + "\"\n");
                fieldsQml += ("        pattern: \".*\\\\S.*\"\n");
                fieldsQml += ("        multiLine: true\n");
                fieldsQml += ("    }\n");
            }
            else {
                let decimals = field["type"] === "esriFieldTypeInteger" ? 0 : 4;
                fieldsQml += ("    NumberField {\n");
                fieldsQml += ("        uid: \"" + field["uid"] + "\"\n");
                fieldsQml += ("        nameElementUid: \"" + field["uid"] + "\"\n");
                if (field["list"].length > 0) fieldsQml += ("        listElementUid: \"" + field["uid"] + "\"\n");
                fieldsQml += ("        exportUid: \"" + field["name"] + "\"\n");
                fieldsQml += ("        decimals: " + decimals + "\n");
                fieldsQml += ("    }\n");
            }
        }
    }

    fieldsQml += ("}")

    return new File([
        fieldsQml
    ], "Fields.qml", {
        type: "text/plain"
    })
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = async function createExecute(mtdt) {
    let zip = new JSZip();

    const createLayerPromise = createLayer(mtdt);

    for (let i = 0; i < mtdt.length; i++) {
        const layer = mtdt[i];
        if (layer["icon"] !== null) zip.file(layer["icon"]["name"], layer["icon"]);
        for (let j = 0; j < layer["fields"].length; j++) {
            const field = layer["fields"][j];
            if (field["icon"] !== null) zip.file(field["icon"]["name"], field["icon"]);
            for (let k = 0; k < field["list"].length; k++) {
                const item = field["list"][k];
                if (item["icon"] !== null) zip.file(item["icon"]["name"], item["icon"]);
            }
        }
    }

    const elementsQmlFile = createelementsQml(mtdt);
    zip.file("Elements.qml", elementsQmlFile);

    const fieldsQmlFile = createFieldsQml(mtdt);
    zip.file("Fields.qml", fieldsQmlFile);

    let response = await createLayerPromise;
    if (response["error"]) {
        console.log(response);
        return;
    }
    mtdt[0]["url"] = response["url"];
    
    const mtdtFile = new File([
        JSON.stringify(mtdt)
    ], "mtdt.json", {
        type: "application/json"
    });
    zip.file("mtdt.json", mtdtFile);

    const zipFilename = mtdt[0]["name"] + ".zip";
    response = await uploadZip(zipFilename, zip);
}