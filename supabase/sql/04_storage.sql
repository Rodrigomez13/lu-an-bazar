begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'loan-documents',
  'loan-documents',
  false,
  10485760,
  array['image/jpeg','image/png','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists product_images_staff_insert on storage.objects;
create policy product_images_staff_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (select private.has_any_role(array['admin','catalog_manager']::public.app_role[]))
  );

drop policy if exists product_images_staff_update on storage.objects;
create policy product_images_staff_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and (select private.has_any_role(array['admin','catalog_manager']::public.app_role[]))
  )
  with check (
    bucket_id = 'product-images'
    and (select private.has_any_role(array['admin','catalog_manager']::public.app_role[]))
  );

drop policy if exists product_images_staff_delete on storage.objects;
create policy product_images_staff_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (select private.has_any_role(array['admin']::public.app_role[]))
  );

drop policy if exists loan_documents_finance_all on storage.objects;
create policy loan_documents_finance_all on storage.objects
  for all to authenticated
  using (
    bucket_id = 'loan-documents'
    and (select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[]))
  )
  with check (
    bucket_id = 'loan-documents'
    and (select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[]))
  );

commit;
