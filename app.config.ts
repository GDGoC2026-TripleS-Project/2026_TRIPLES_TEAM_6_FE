import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  scheme: 'lastcup',
  name: '라스트컵',
  slug: 'lastcup',
  version: '1.0.1',
  platforms: ['ios'],
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: false,
  jsEngine: 'jsc',
  splash: {
    image: './assets/icon-splash.png',
    backgroundColor: '#111111',
  },
  ios: {
    googleServicesFile: './GoogleService-Info.plist',
    bundleIdentifier: 'com.triples.lastcup',
    buildNumber: '5',
    supportsTablet: true,
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleDisplayName: '라스트컵',
    },
    appleTeamId: '37G422NWZY',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    intentFilters: [
      {
        action: 'VIEW',
        data: [{ scheme: 'lastcup' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.triples.lastcup',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-font',
    'expo-web-browser',
    '@react-native-community/datetimepicker',
    [
      '@react-native-seoul/kakao-login',
      {
        kakaoAppKey: '697c4d3c42b546e3401cb2763ff37c7f',
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '15.1',
        },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
  ],
  extra: {
    eas: {
      projectId: 'f2fd9b7c-43e3-41e0-a0ee-67617f477007',
    },
  },
  runtimeVersion: '1.0.1',
  updates: {
    url: 'https://u.expo.dev/f2fd9b7c-43e3-41e0-a0ee-67617f477007',
  },
  owner: 'gkstldus22',
};

export default config;
