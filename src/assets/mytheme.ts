import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';

export const MyPreset = definePreset(Lara, {
    semantic: {
        colorScheme: {
            light: {
                primary: {
                    50: '{blue.50}',
                    100: '{blue.100}',
                    200: '{blue.200}',
                    300: '{blue.300}',
                    400: '{blue.400}',
                    500: '{blue.500}',
                    600: '{blue.600}',
                    700: '{blue.700}',
                    800: '{blue.800}',
                    900: '{blue.900}',
                    950: '{blue.950}'
                },
                surface: {
                    0: '#ffffff',
                    50: '{zinc.50}',
                    100: '{zinc.100}',
                    200: '{zinc.200}',
                    300: '{zinc.300}',
                    400: '{zinc.400}',
                    500: '{zinc.500}',
                    600: '{zinc.600}',
                    700: '{zinc.700}',
                    800: '{zinc.800}',
                    900: '{zinc.900}',
                    950: '{zinc.950}'
                },
                custom: {
                    buttoncolor: 'rgba(255,255,0,1)'
                }
            },
            dark: {
                primary: {
                    50: '{purple.50}',
                    100: '{purple.100}',
                    200: '{purple.200}',
                    300: '{purple.300}',
                    400: '{purple.400}',
                    500: '{purple.500}',
                    600: '{purple.600}',
                    700: '{purple.700}',
                    800: '{purple.800}',
                    900: '{purple.900}',
                    950: '{purple.950}'
                },
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                }
            }
        }
    }
});