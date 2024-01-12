# GTM JSON to YAML

Convert Google Tag Manager import/export JSON files to/from human-friendly YAML files.

Create your repeatable GTM configuration like this:

```yaml
variables:
  - name: Custom DataLayer Variable
    type: v
    parameter:
      - type: INTEGER
        key: dataLayerVersion
        value: '2'
      - type: BOOLEAN
        key: setDefaultValue
        value: 'false'
      - type: TEMPLATE
        key: name
        value: dataLayerParam
triggers:
  - &ref_custom_trigger
    name: Custom Trigger
    type: CUSTOM_EVENT
    customEventFilter:
      - type: EQUALS
        parameter:
          - type: TEMPLATE
            key: arg0
            value: '{{_event}}'
          - type: TEMPLATE
            key: arg1
            value: customDataLayerEvent
tags:
  - name: Custom HTML Tag
    type: html
    parameter:
      - type: TEMPLATE
        key: html
        value: |-
          <script>
            console.log({{ Custom DataLayer Variable }})
          </script>
      - type: BOOLEAN
        key: supportDocumentWrite
        value: 'false'
    firingTriggerId:
      - *ref_custom_trigger
    tagFiringOption: ONCE_PER_EVENT
    consentSettings:
      consentStatus: NOT_SET
    monitoringMetadata:
      type: MAP
```
