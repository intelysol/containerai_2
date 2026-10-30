export interface CapacitorPluginConfig {
  [key: string]: any;
}

export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: {
    url?: string;
    cleartext?: boolean;
    androidScheme?: string;
  };
  plugins?: CapacitorPluginConfig;
}

const config: CapacitorConfig = {
  appId: 'ai.containercheck.app',
  appName: 'ContainerCheck AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    Preferences: {
      group: 'ContainerCheckAIPreferences',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#142B45',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#12A89D',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
