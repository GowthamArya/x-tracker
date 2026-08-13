import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xtracker.app',
  appName: 'X-Tracker',
  webDir: 'www',
  bundledWebRuntime: false,
  ios: { contentInset: 'automatic' },
  android: { allowMixedContent: false }
};

export default config;
