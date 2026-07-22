# Base de datos de Lu An Bazar

Ejecutá estos archivos, en orden, desde **Supabase → SQL Editor** en el proyecto
`cxywdhdzmbjitprfgfyz`:

1. `01_schema.sql`
2. `02_triggers.sql`
3. `03_rls_and_grants.sql`
4. `04_storage.sql`
5. `05_views_and_queries.sql`
6. `06_seed_catalog.sql` (carga los productos que hoy ya están en la web)
7. `07_financial_panel.sql` (configuración, permisos explícitos y alta atómica de préstamos/cuotas)
8. `08_app_settings_repair.sql` (repara instalaciones previas sin configuración)
9. `09_meta_social_hub.sql` (borradores, publicaciones e importación segura desde Meta)

Después:

1. Creá el primer usuario administrativo en **Authentication → Users**.
2. Copiá su UUID y ejecutá:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID-DEL-USUARIO';
```

3. Cargá en `.env.local` la clave **Publishable** y la clave **Secret** del
   proyecto. La Secret nunca debe llevar el prefijo `NEXT_PUBLIC_`.

El módulo de préstamos queda deliberadamente aislado: no tiene permisos para
`anon`, no se incluye en ninguna vista pública y sólo acepta roles financieros.

`07_financial_panel.sql` también agrega los `GRANT` explícitos para
`service_role`, necesarios en proyectos nuevos donde las tablas ya no se
exponen automáticamente a la Data API. La función que crea préstamos usa
`security invoker`, está revocada para `public`, `anon` y `authenticated`, y sólo
puede ejecutarse desde el servidor con la clave Secret.

Los archivos son seguros para una primera instalación. Si más adelante cambia
el esquema de una base ya poblada, conviene crear migraciones incrementales en
lugar de volver a ejecutar el esquema completo.

`09_meta_social_hub.sql` no publica nada por sí solo. Mantiene una cola privada,
protegida con RLS, y deja que las rutas del servidor usen el token de Página sin
exponerlo al navegador.
