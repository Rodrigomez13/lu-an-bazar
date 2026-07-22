# Conexión de Lu An Bazar con Meta

La aplicación ya incluye:

- feed CSV en `/api/meta/catalog`, generado únicamente con productos públicos y con precio;
- enlaces de producto con parámetros UTM para identificar tráfico de Facebook/Instagram;
- Meta Pixel condicionado al consentimiento del visitante;
- Conversions API con deduplicación mediante `event_id`;
- lista multiproducto que genera una consulta completa por WhatsApp;
- panel de estado en `/admin/sistema/meta`.
- centro de publicaciones en `/admin/publicaciones`;
- borradores comerciales generados desde cada producto;
- importación de publicaciones de la fan page a una cola privada de revisión;
- webhook de Página firmado en `/api/meta/webhooks/page`.

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
META_PAGE_ID=
META_PAGE_ACCESS_TOKEN=
META_WEBHOOK_VERIFY_TOKEN=
META_WEBHOOK_APP_SECRET=
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

## Vincular la fan page con la web

### 1. Preparar la base de datos

En Supabase → SQL Editor, ejecutá `supabase/sql/09_meta_social_hub.sql`. La tabla
creada es privada, usa RLS y sólo admite los roles `admin` y `catalog_manager`.

### 2. Confirmar activos y permisos en Meta

1. En **Configuración del negocio → Cuentas → Páginas**, elegí Lu An Bazar.
2. Confirmá que tu usuario tenga control total sobre la Página.
3. En **Orígenes de datos → Catálogos**, asigná la misma Página y tu usuario.
4. En **Orígenes de datos → Datasets**, confirmá el Dataset `1210916538775742`.
5. La cuenta restringida debe recuperar “Calidad de la cuenta” antes de crear
   tokens nuevos. Mientras tanto usá “Copiar y abrir Facebook” desde el panel.

### 3. Crear o configurar una app de Meta

1. Entrá en Meta for Developers → Mis aplicaciones y creá una app de tipo Empresa.
2. Asociá la app al portafolio de Lu An Bazar.
3. Agregá los productos **Facebook Login for Business** y **Webhooks**.
4. Solicitá para el usuario/token los permisos `pages_show_list`,
   `pages_read_engagement`, `pages_manage_posts` y, para suscribir el webhook,
   `pages_manage_metadata`.
5. En modo desarrollo sólo las personas con rol en la app pueden usarla. Para
   otros usuarios se requiere App Review y poner la app en modo activo.

### 4. Obtener ID y token de Página

1. Abrí Graph API Explorer, elegí la app y generá un token de usuario con los
   permisos anteriores.
2. Ejecutá `GET /me/accounts?fields=id,name,access_token`.
3. Buscá “Lu An Bazar”: copiá `id` a `META_PAGE_ID` y su `access_token` a
   `META_PAGE_ACCESS_TOKEN`.
4. No uses el token del Pixel/Conversions API en esta variable: son credenciales
   distintas. El token de Página permite leer y publicar; el de Conversions API
   únicamente envía eventos al Dataset.
5. Para producción, obtené un token de usuario de larga duración y volvé a pedir
   `/me/accounts`; registrá su vencimiento y rotación.

### 5. Configurar el webhook

1. Generá localmente una cadena aleatoria larga y guardala en
   `META_WEBHOOK_VERIFY_TOKEN`.
2. Copiá el secreto de la app en `META_WEBHOOK_APP_SECRET`.
3. En Meta Webhooks elegí **Page** y usá como callback
   `https://lu-an-bazar.vercel.app/api/meta/webhooks/page`.
4. Como token de verificación pegá exactamente el valor de
   `META_WEBHOOK_VERIFY_TOKEN`.
5. Suscribí el campo `feed` y luego suscribí la app a la Página.
   En Graph API Explorer podés hacerlo con
   `POST /PAGE_ID/subscribed_apps?subscribed_fields=feed` usando el token de
   Página; la respuesta esperada es `success: true`.
6. La aplicación valida `X-Hub-Signature-256`; los avisos sin firma válida se
   rechazan y jamás modifican productos directamente.

### 6. Cargar secretos y desplegar

Agregá las cuatro variables de Página/Webhook en Vercel, para Production,
Preview y Development según corresponda. Redeployá después de guardarlas. Nunca
les agregues el prefijo `NEXT_PUBLIC_`.

### 7. Probar el flujo web → Facebook

1. Abrí Panel → Productos y tocá **Publicar** en un artículo.
2. Creá el borrador, revisá texto y enlace.
3. Primero probá **Copiar y abrir Facebook**.
4. Cuando el token esté activo, usá **Publicar** y comprobá el enlace en la fan
   page. En Events Manager verificá `ViewContent` al abrir la ficha.

### 8. Probar el flujo Facebook → web

1. Creá una publicación de prueba en la fan page con foto, título y precio.
2. En Panel → Publicaciones Meta → Importar, tocá **Sincronizar fan page**.
3. Corregí título, descripción, precio y categoría.
4. Tocá **Crear producto borrador** y revisalo desde Productos.
5. Publicalo sólo cuando imagen, precio y stock sean correctos. Nunca se
   reemplaza automáticamente un producto ya existente.

## Límites deliberados

- Facebook no es la fuente maestra de stock ni precios.
- Una publicación importada siempre requiere aprobación humana.
- Los tokens sólo se usan en rutas del servidor.
- El catálogo, Pixel y fan page no leen tablas de préstamos personales.
- Si Meta mantiene la restricción de la cuenta, feed, Pixel y el flujo manual
  continúan funcionando; publicación automática, importación y webhook esperan.
