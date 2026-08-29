import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

registerRootComponent(App);
AppRegistry.registerComponent('main', () => App);
