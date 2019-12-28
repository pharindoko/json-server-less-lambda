import {Command, flags} from '@oclif/command'
import Listr = require('listr');
import { AppConfig } from 'json-serverless-lib';
import * as child from 'child_process';
import * as path from 'path'; 
import fs from 'fs';
export class Deploy extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    name: flags.string({
      char: 'n',                    // shorter flag version
      description: 'name of the api/stack', // help description for flag
      hidden: false,                // hide from help
      multiple: false,              // allow setting this flag multiple times
      default: 'json-serverless',             // default value if flag not passed (can be a function that returns a string or undefined)
      required: true,              // make flag required (this is not common and you should probably use an argument instead)
    }),
    readonly: flags.boolean({
      char: 'r',                    // shorter flag version
      description: 'set api to readonly (true) or writeable (false)', // help description for flag
      hidden: false,                // hide from help
      default: false,             // default value if flag not passed (can be a function that returns a string or undefined)
      required: false,             // default value if flag not passed (can be a function that returns a string or undefined)
    }),
    swagger: flags.boolean({
      char: 's',                    // shorter flag version
      description: 'activate swagger ui support', // help description for flag
      hidden: false,                // hide from help
      default: true,             // default value if flag not passed (can be a function that returns a string or undefined)
      required: false,            // make flag required (this is not common and you should probably use an argument instead)
    }),
    apikeyauth: flags.boolean({
      char: 'a',                    // shorter flag version
      description: 'require api key authentication to access api', // help description for flag
      hidden: false,                // hide from help
      default: false,             // default value if flag not passed (can be a function that returns a string or undefined)
      required: false,           // make flag required (this is not common and you should probably use an argument instead)
    })
  }

  static args = [
    {
      name: 'file',               // name of arg to show in help and reference with args[name]
      required: true,            // make the arg required with `required: true`
      description: 'path of JSON file', // help description
      hidden: false,               // hide this arg from help
    }
  ]

  async run() {
    const {args, flags} = this.parse(Deploy)

    const tasks = new Listr([
      {
          title: 'Deploy',
          task: async () => {
            const appconfig = new AppConfig();
            let filePath = args.file;
            if(!path.isAbsolute(args.file)) {
              filePath = path.normalize(process.cwd() + "/" + args.file);
            }
            console.log("currentDirectory: " + filePath);
            console.log(this.config.root + "/serverless.yml");
            appconfig.jsonFile = filePath;
            appconfig.enableApiKeyAuth = flags.apikeyauth;
            appconfig.readOnly = flags.readonly;
            appconfig.enableSwagger =flags.swagger;
            appconfig.stackName = flags.name;
            fs.writeFileSync(this.config.root + '/config/appconfig.json', JSON.stringify(appconfig, null, 2), 'utf-8');
            const exec = require('child_process').exec;
            const slsProcess = exec('sls deploy', {cwd: this.config.root});
            slsProcess.stdout.pipe(process.stdout);;
            slsProcess.on('exit', () => {              
              Promise.resolve();
            })
          }
      },
      {
          title: 'Done',
          task: () => {
            console.log('done');
          }
      }
  ]);
  tasks.run().catch(err => {
    console.error(err);
});

  }
}