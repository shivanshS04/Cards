import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";


const manifestForPlugin ={
  registerType : 'prompt',
  includeAssets : ['websiteLogo.png'],
  manifest:{
    name : 'Cards Extractor',
    short_name: 'CardEx',
    description: 'This app is useful in extracting text information from images and exporting details in excel format',
    orientation: 'portrait',
    display:'standalone',
    start_url:'/',
    theme_color: '#111',
    background_color: '#fff',
    icons:[
      {
        src:'/websiteLogo.png',
        sizes :'225x225',
        type:'image/png',
        purpose: 'any maskable'
      }
    ]
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), VitePWA(manifestForPlugin)],
});