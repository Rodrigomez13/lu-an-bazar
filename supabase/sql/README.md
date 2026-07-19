# Base de datos de Lu An Bazar

Ejecutá estos archivos, en orden, desde **Supabase → SQL Editor** en el proyecto
`cxywdhdzmbjitprfgfyz`:

1. `01_schema.sql`
2. `02_triggers.sql`
3. `03_rls_and_grants.sql`
4. `04_storage.sql`
5. `05_views_and_queries.sql`
6. `06_seed_catalog.sql` (carga los productos que hoy ya están en la web)

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

Los archivos son seguros para una primera instalación. Si más adelante cambia
el esquema de una base ya poblada, conviene crear migraciones incrementales en
lugar de volver a ejecutar el esquema completo.
