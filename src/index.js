'use strict';

const fs = require('fs');
const glob = require("glob-fs")({ gitignore: true });

class ServerlessPlugin {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.hooks = {
        'after:aws:package:finalize:mergeCustomProviderResources': this.package.bind(this),
        };
    }

    /**
     * Before packaging functions must be redirected to point at the binary built
     */
    package() {
        this.serverless.cli.log(`Getting cloudformation`);
        let cft = JSON.stringify(this.serverless.service.provider.compiledCloudFormationTemplate);
        let matches = cft.match(/\#workflow\([\.\-\Wa-zA-Z0-9]*?\)/g);
        if(matches) {
            this.serverless.cli.log(`Retrieved matches ` + matches.length);
            for(let match in matches) {
                let file = matches[match];
                this.serverless.cli.log(`${match}: ${file}`);
                let dirName = file.substr(10, file.length - 11);
                let param2Index = dirName.indexOf(',');
                let removeFirstAndLast = false;
                if(param2Index >= 0) {
                    let p2 = dirName.substr(param2Index + 1);
                    removeFirstAndLast = (p2.trim().toLowerCase() === 'true');
                    dirName = dirName.substr(0, param2Index);
                }
                this.serverless.cli.log('dirName:' + dirName);
                let output = '';
                if(dirName.indexOf('*') >= 0 || fs.lstatSync(dirName).isDirectory()) {
                    let files = glob.readdirSync(dirName, {});
                    let processedPaths = {};
                    this.serverless.cli.log('files:' + JSON.stringify(files));
                    for(let ii in files) {
                        let filePath = files[ii];
                        if(processedPaths[filePath]) {
                            continue;
                        }
                        processedPaths[filePath] = true;
                        this.serverless.cli.log(filePath);
                        let content = fs.readFileSync(filePath).toString('UTF-8');
                        if(output.length > 0) {
                            output += '\n';
                        }
                        if(removeFirstAndLast) {
                            let firstRowEnd = content.indexOf('\n');
                            let lastRowStart = (content.indexOf('\r') >= 0)? content.lastIndexOf('\r') : content.lastIndexOf('\n');
                            content = content.substr(firstRowEnd + 1, lastRowStart - firstRowEnd - 1);
                        }
                        output += content;
                    }
                } else {
                    output = fs.readFileSync(dirName).toString('UTF-8');
                    if(removeFirstAndLast) {
                        let firstRowEnd = output.indexOf('\n');
                        let lastRowStart = (output.indexOf('\r') >= 0)? output.lastIndexOf('\r') : output.lastIndexOf('\n');
                        output = output.substr(firstRowEnd + 1, lastRowStart - firstRowEnd - 1);
                    }
                }

                const stepMatches = output.match(/"Step:\w+":\W*"\w*"/g);
                if(stepMatches) {
                    for(let match of stepMatches) {
                        const name = match.match(/(?<="Step:\w+":\W*")\w*/);
                        output = output.replace(match, '${' + name[0] + '}');
                    }
                }

                let data = JSON.stringify(output);
                data = data.replace(/\\r\\n/g, '\\n');
                cft = cft.replace(file, data.substr(1, data.length - 2));
            }

            this.serverless.service.provider.compiledCloudFormationTemplate = JSON.parse(cft);
        }
    }
}

module.exports = ServerlessPlugin