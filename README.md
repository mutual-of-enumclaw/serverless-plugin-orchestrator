# serverless-plugin-orchestrator
With orchestrator workflows it can be challenging to manage your primary workflow step function document in a
format that be used with Fn::Sub.  This plugin allows an approach for creating step functions, which will insert
replacable components used to work with orchestrator workflows.

# Implementing

Install the plugin into the directory your serverless.yml is located
```!bash
npm install serverless-plugin-orchestrator
```

Add the decouple plugin to your plugins, and add a custom variable to turn it on
```yaml
plugins:
    - serverless-plugin-orchestrator

custom:
    fileContent: 
        Fn::Sub:
            - "#catdir(./path/to/file.json)"
            - Step1: "Value from converted template"
```

The workflow would be setup with properties names "Step:*Step Name*":"*Step Name*".  This is then used to replace that property with the value from the parameters.

```json
{
    "Comment": "An example workflow which has 1 orchestrator step",
    "StartAt": "Step1Start",
    "States": {
        "Step:Step1": "Step1"
    }
}
```

