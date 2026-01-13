# Manual Técnico - Calculadora Andreani

Hola! Si estás leyendo esto es porque queres meter mano en el código o levantar el proyecto. Quedate tranquilo que es bastante standard.

## ¿Qué necesitás tener?

Básicamente, **Node.js**.
Abrí la terminal y tirá `node -v` si te devuelve algo tipo `v18...` o superior, ya estás. Si no, bajalo de la página oficial de Node

⚠️ **Dato Clave**: Necesitás sí o sí el archivo `precios envios bigger.csv`, con el formato que entrega Andreani. La app NO lo trae incluido ya que diferentes usuarios pueden tener diferentes tablas de precios. Asegurate de tenerlo a mano para probar porque si no, no va a calcular nada.

## Levantar el proyecto (Paso a paso)

Es fácil, seguime:

1.  **Entrá a la carpeta**:
    Abrí la terminal donde tengas el proyecto.

2.  **Instalá las dependencias**:
    Ejecutá el comando para que se bajen todas las librerías (React, Tailwind, etc):
    ```bash
    npm install
    ```

3.  **Arrancá el servidor**:
    Dale mecha con:
    ```bash
    npm run dev
    ```
    Ahí te va a decir "Local: http://localhost:5173/". Abrí eso en el navegador y ya estás andando.

## Un vistazo al código (para que no te pierdas)

La estructura es simple:

*   **`src/App.jsx`**: Es el cerebro. Ahí está toda la lógica de qué pasa cuando tocas algo.
*   **`src/utils/pricing.js`**: Acá están las cuentas matemáticas. Si hay que cambiar la fórmula del volumen o cómo se cobra el excedente, es acá.
*   **`src/utils/csvParser.js`**: Este archivo es el que "mastica" el CSV de Andreani. Es medio complejo porque el CSV original tiene un formato muy complicado (gracias Andreani), así que si cambiás el formato del Excel, revisá esto.
*   **`src/components/`**: Acá están los pedacitos de la interfaz (la zona de carga, los inputs de medidas, etc).

## Cosas a tener en cuenta

*   **Estilos**: Usamos **Tailwind CSS**. Si ves clases tipo `bg-andreani-red` o `p-4`, es eso.
*   **Iconos**: Son de la librería `lucide-react`.
