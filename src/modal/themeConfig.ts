export interface ThemeConfig {
    autoModeSwitch: boolean;
    colors: {
      primaryColor: string;
      secondaryColor: string;
    };
  }
  
  export const defaultThemeConfig: ThemeConfig = {
    autoModeSwitch: true,
    colors: {
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
    },
  };
  