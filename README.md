# Calculadora Envíos Bigger (Andreani)

Buenas! Esta es la calculadora de envíos bigger que armé para Andreani (en realidad para facilitar el calculo de envíos, al sector de e-commerce donde trabajo) ya que Andreani no cuenta con una calculadora online Bigger. La idea es cotizar envíos rápido usando tus propias tablas de precios, siempre teniendo el archivo que te entrega andreani, que cuenta con la estructura correcta para que la app funcione.

**Desarrollado por mí Nahuel Reis y AntiGravity** 

## ¿Qué hace esta app?

Básicamente, le tirás tu CSV de precios y te calcula cuánto sale el envío. Algunas cositas:

*   **Es inteligente con el volumen**: Si tenés un paquete liviano pero gigante (onda telgopor), te avisa y te cobra por el tamaño, no por el peso. Usa el cálculo standard de `(Alto x Ancho x Prof * 3.5) / 10000`. Calculo estandar de andreani.
*   **Maneja los excedentes**: Si te pasás del peso máximo de la tabla (por ej. 350kg), automáticamente te suma el recargo por cada kilo extra.
*   **Buscador que vuela**: Escribís el CP y te lo encuentra al instante, aunque tengas miles en la lista.
*   **Extras y "Cosas raras"**: Tenés que cobrar seguro? Impuestos? Un recargo fijo? Lo agregás ahí nomás con un click, sea en pesos o porcentaje.

## Cómo la uso?

Es súper intuitivo:
1.  **Arrastrá el archivo**: Arrastrá el `precios envios bigger.csv` al cuadrado gris del principio.
2.  **Llená los datos**: Poné el CP de destino y cuánto mide/pesa el paquete.
3.  **Listo**: A la derecha (o abajo en el celu) vas a ver el precio final desglosado.

Si querés agregar recargos, usá los botones de abajo. ¡Eso es todo!
