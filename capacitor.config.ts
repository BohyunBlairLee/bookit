import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bookit.app',
  appName: 'Bookit',
  webDir: 'dist/public',
  server: {
    url: 'http://localhost:3000',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
