const fs = require('node:fs');
const yaml = require('js-yaml');

function yamlToGtmJson(yamlString) {
    function addIds(obj, indexName, indexCounter) {
        obj.accountId = '1234567890';
        obj.containerId = '12345678';
        if (indexName) {
            obj[indexName] = indexCounter;
            indexCounter++;
        }
        return obj;
    }

    const yamlObject = yaml.load(yamlString);

    const indexCounters = {
        folders: 1,
        tags: 1,
        triggers: 1,
        variables: 1,
        customTemplates: 1
    }

    const folders = (yamlObject.folders || []).map(f => {
        addIds(f, 'folderId', indexCounters.folders);
        return f;
    });

    const variables = yamlObject.variables.map(v => {
        addIds(v, 'variableId', indexCounters.variables);
        if (v.parentFolderId) {
            v.parentFolderId =  v.parentFolderId.folderId;
        }
        return v;

    });

    const triggers = yamlObject.triggers.map(t => {
        addIds(t, 'triggerId', indexCounters.triggers);
        if (t.parentFolderId) {
            t.parentFolderId =  t.parentFolderId.folderId;
        }
        return t;
    });

    const customTemplates = (yamlObject.customTemplates || []).map(t => {
        addIds(t, 'templateId', indexCounters.customTemplates);
        return t;
    });

    const tags = yamlObject.tags.map(t => {
        if (t?.type === Object) {
            t.type = 'cvt_44705416_' + t.type.templateId;
        }
        addIds(t, 'tagId', indexCounters.tags);
        if (t.parentFolderId) {
            t.parentFolderId =  t.parentFolderId.folderId;
        }
        t.firingTriggerId = t.firingTriggerId.map(trigger => {
            return trigger.triggerId;
        });
        return t;
    });

    const builtInVariables = (yamlObject.builtInVariables || []).map(v => {
        addIds(v, 'tagId');
        return v;
    });


    const container = {
        exportFormatVersion: 2,
        exportTime: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        containerVersion: {
            tag: tags,
            trigger: triggers,
            variable: variables,
            folder: folders,
            builtInVariable: builtInVariables,
            customTemplate: customTemplates
        }
    };

    addIds(container.containerVersion);

    return container;
}

function gtmJsonToYaml(gtmObject) {
    const folders = (gtmObject.containerVersion.folder || []).map(f => {
        return {
            name: f.name,
            folderId: f.folderId
        };
    });

    const foldersById = folders.reduce((agg, f) => {
        agg[f.folderId] = f;
        delete f.folderId;
        return agg;
    }, {});

    const variables = (gtmObject.containerVersion.variable || []).map(v => {
        return {
            name: v.name,
            type: v.type,
            parameter: v.parameter,
            formatValue: v.formatValue,
            parentFolderId: foldersById[v.parentFolderId]
        };
    });

    const triggers = (gtmObject.containerVersion.trigger || []).map(t => {
        return {
            triggerId: t.triggerId,
            name: t.name,
            type: t.type,
            customEventFilter: t.customEventFilter,
            parentFolderId: foldersById[t.parentFolderId]
        };
    });

    const triggersById = triggers.reduce((agg, f) => {
        agg[f.triggerId] = f;
        delete f.triggerId;
        return agg;
    }, {});

    const customTemplates = (gtmObject.containerVersion.customTemplate || []).map(t => {
        return  {
            name: t.name,
            templateId: t.templateId,
            templateData: t.templateData,
            galleryReference: t.galleryReference
        };
    });

    const customTemplatesById = customTemplates.reduce((agg, t) => {
        agg[t.templateId] = t;
        delete t.templateId;
        return agg;
    }, {});

    const tags = (gtmObject.containerVersion.tag || []).map(t => {

        let type = t.type;
        if (customTemplatesById[t.type.split('_').pop()]) {
            type = customTemplatesById[t.type.split('_').pop()];
        }
        return {
            name: t.name,
            type,
            parameter: t.parameter,
            firingTriggerId: t.firingTriggerId.map(tId => {
                if (triggersById[tId]) {
                    return triggersById[tId];
                }
                return tId;
            }),
            parentFolderId: foldersById[t.parentFolderId],
            tagFiringOption: t.tagFiringOption,
            consentSettings: t.consentSettings,
            monitoringMetadata: t.monitoringMetadata
        };
    });

    const builtInVariables = (gtmObject.containerVersion.builtInVariable || []).map(v => {
        return  {
            name: v.name,
            type: v.type
        };
    });


    const container = {
        folders,
        customTemplates,
        builtInVariables,
        variables,
        triggers,
        tags: tags
    };
    return yaml.dump(container);
}


module.exports = {
    yamlToGtmJson,
    gtmJsonToYaml
}