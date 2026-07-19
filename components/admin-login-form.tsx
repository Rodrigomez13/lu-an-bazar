"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAdmin } from "@/app/ingresar/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, { error: "" });
  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Usuario o correo</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Verificando…" : "Ingresar al panel"}
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/">Volver al catálogo</Link>
        </Button>
      </FieldGroup>
    </form>
  );
}
