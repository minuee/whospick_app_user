import {PureComponent} from 'react';
import codePush from 'react-native-code-push';
export const codePushOptions = {
    installMode: codePush.InstallMode.IMMEDIATE,
    checkFrequency: codePush.CheckFrequency.MANUAL,
    mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
    updateDialog: false,
};
export class CodePush extends PureComponent {
    async componentDidMount() {
        await codePush.sync(codePushOptions);
        await codePush.notifyAppReady();
    }
    render() {
        return null;
    }
}
const cfCodePush = codePush(codePushOptions)(CodePush);
module.exports = cfCodePush;
