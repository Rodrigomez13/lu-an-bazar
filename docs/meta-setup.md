# Conexión de Lu An Bazar con Meta

La aplicación ya incluye:

- feed CSV en `/api/meta/catalog`, generado únicamente con productos públicos y con precio;
- enlaces de producto con parámetros UTM para identificar tráfico de Facebook/Instagram;
- Meta Pixel condicionado al consentimiento del visitante;
- Conversions API con deduplicación mediante `event_id`;
- lista multiproducto que genera una consulta completa por WhatsApp;
- panel de estado en `/admin/sistema/meta`.

## Datos requeridos

1. URL exacta de la página de Facebook.
2. URL de la cuenta profesional de Instagram vinculada a la página.
3. ID del Pixel o Dataset de Events Manager.
4. ID del catálogo de Commerce Manager.
5. Token de Conversions API, cargado directamente como secreto de Vercel.
6. Versión vigente de Graph API indicada por Meta.
7. Un dominio propio y acceso DNS si se quiere verificar un dominio distinto de `vercel.app`.

No se necesita la contraseña personal de Facebook.

## Variables

Las variables públicas pueden configurarse en todos los entornos. Los tokens deben
guardarse solo como secretos de Vercel:

```text
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_META_PIXEL_ID=
META_PIXEL_ID=
META_CATALOG_ID=
META_GRAPH_API_VERSION=
META_CONVERSIONS_API_TOKEN=
META_TEST_EVENT_CODE=
```

`META_TEST_EVENT_CODE` debe eliminarse al terminar las pruebas.

## Activación

1. Crear un catálogo de comercio electrónico en Commerce Manager.
2. Agregar un origen por feed programado usando `https://TU-DOMINIO/api/meta/catalog`.
3. Programar la lectura diaria.
4. Crear o seleccionar el Dataset web en Events Manager.
5. Cargar las variables en Vercel y desplegar nuevamente.
6. Desde "Probar eventos", visitar una ficha, agregarla a la lista y consultar por WhatsApp.
7. Confirmar que aparecen `PageView`, `ViewContent`, `AddToCart` y `Contact`.

La web y Supabase son la fuente de verdad. Las altas, precios, stock, ofertas e
imágenes se gestionan en el panel de Lu An Bazar y luego se sincronizan hacia Meta.
El feed y los eventos no leen ni exponen información de préstamos personales.
