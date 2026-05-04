import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bookit.app',
  appName: 'BookIt',
  webDir: 'dist/public',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://bookit-production-d54c.up.railway.app',
    cleartext: false,
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;
