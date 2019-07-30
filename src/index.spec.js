const workflow = require('./index');

const serverlessMock = {
    service: {
        provider: {
            compiledCloudFormationTemplate: {}
        }
    },
    cli: {
        log: (message) => {
            console.log(message);
        }
    }
};

describe('index', () => {
    describe('workflow', () => {
        it('no workflow found', () => {
            serverlessMock.service.provider.compiledCloudFormationTemplate = require('../data/no.resource.cloudformation.json');
            const instance = new workflow(serverlessMock);
            instance.package();
        });

        it('workflow scenario 1', () => {
            serverlessMock.service.provider.compiledCloudFormationTemplate = require('../data/single.param.cloudformation.json');
            const instance = new workflow(serverlessMock);
            instance.package();

            expect(serverlessMock.service.provider.compiledCloudFormationTemplate.Resources.RetrieveDataLogGroup.Properties.LogGroupName)
            .toBe('{\n    "step": {\n\n    },\n    ${Test}\n}');
        });

        it('workflow scenario 2', () => {
            serverlessMock.service.provider.compiledCloudFormationTemplate = require('../data/single.2.param.cloudformation.json');
            const instance = new workflow(serverlessMock);
            instance.package();
            console.log(serverlessMock.service.provider.compiledCloudFormationTemplate.Resources.RetrieveDataLogGroup.Properties.LogGroupName);
            expect(serverlessMock.service.provider.compiledCloudFormationTemplate.Resources.RetrieveDataLogGroup.Properties.LogGroupName)
            .toBe('{\n    "step": {\n\n    },\n    ${Test},\n    ${Test2}\n}');
        });
    });
});