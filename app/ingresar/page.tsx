'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function Login(){const router=useRouter();return <main className="grid min-h-screen bg-brand-navy md:grid-cols-2"><section className="hidden flex-col justify-between p-12 text-brand-cream md:flex"><Brand/><div><p className="text-xs uppercase tracking-[.3em] text-primary">Tu espacio Lu An</p><h1 className="mt-4 max-w-xl font-serif text-6xl">Todo lo que elegiste, en un solo lugar.</h1><p className="mt-5 max-w-md leading-relaxed text-brand-cream/60">Consultá cuotas, compras, solicitudes y novedades de tu cuenta.</p></div><p className="text-xs text-brand-cream/40">Formosa · Argentina</p></section><section className="flex items-center justify-center bg-background px-5 py-12"><Card className="w-full max-w-md border-0 shadow-xl"><CardHeader><div className="mb-5 md:hidden"><Brand/></div><CardTitle className="font-serif text-4xl">Bienvenida de nuevo</CardTitle><p className="text-sm text-muted-foreground">Ingresá con tus datos para continuar.</p></CardHeader><CardContent><form onSubmit={e=>{e.preventDefault();router.push('/mi-cuenta')}}><FieldGroup><Field><FieldLabel htmlFor="email">Correo electrónico</FieldLabel><Input id="email" type="email" defaultValue="maria@ejemplo.com" required/></Field><Field><div className="flex justify-between"><FieldLabel htmlFor="password">Contraseña</FieldLabel><button type="button" className="text-xs text-primary">Olvidé mi contraseña</button></div><Input id="password" type="password" defaultValue="demostracion" required/></Field><Button type="submit" size="lg" className="w-full">Ingresar</Button><p className="text-center text-sm text-muted-foreground">¿Todavía no tenés cuenta? <Link href="/registro" className="font-semibold text-foreground underline">Registrate</Link></p></FieldGroup></form></CardContent></Card></section></main>}
