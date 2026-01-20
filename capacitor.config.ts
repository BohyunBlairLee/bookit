import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bohyunlee.bookit',
  appName: 'Bookit',
  webDir: 'dist/public',
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
