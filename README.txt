CALENDARIO FOREX - DESPLIEGUE EN NETLIFY

Incluye:
- index.html: interfaz de la aplicación.
- netlify/functions/guardar.mjs: API para crear cuentas, iniciar sesión y guardar historial.
- netlify.toml: configuración de publicación y ruta /api/guardar.
- package.json: dependencia de Netlify Blobs.

PASOS:
1. Descomprime el ZIP.
2. En Netlify, crea un sitio nuevo importando el proyecto desde Git o arrastra la carpeta/proyecto mediante un método de despliegue que admita Netlify Functions.
3. Si usas Git: sube todos los archivos manteniendo la carpeta netlify/functions.
4. Netlify instalará @netlify/blobs y desplegará la función.
5. En el panel del sitio, comprueba que Netlify Blobs esté disponible/activado para el sitio. En sitios Netlify actuales, Blobs se aprovisiona al usar la integración; si el panel solicita habilitarlo, actívalo.
6. Abre la URL del sitio, crea una cuenta y guarda el token que aparece. Ese token es necesario para volver a entrar.

IMPORTANTE:
- No publiques ni compartas tu token: funciona como credencial de acceso.
- Los datos se guardan en Netlify Blobs, no solamente en el navegador.
- Para probar localmente, instala Netlify CLI y ejecuta `npm install` y `netlify dev` desde esta carpeta.
