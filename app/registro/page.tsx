import Link from 'next/link'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function Register(){return <main className="flex min-h-screen items-center justify-center bg-brand-navy px-5 py-12"><Card className="w-full max-w-lg"><CardHeader><Brand/><CardTitle className="mt-5 font-serif text-4xl">Creá tu cuenta</CardTitle><p className="text-sm text-muted-foreground">Guardá tus solicitudes y seguí cada movimiento.</p></CardHeader><CardContent><FieldGroup><div className="grid gap-5 sm:grid-cols-2"><Field><FieldLabel htmlFor="name">Nombre</FieldLabel><Input id="name"/></Field><Field><FieldLabel htmlFor="last">Apellido</FieldLabel><Input id="last"/></Field></div><Field><FieldLabel htmlFor="email">Correo electrónico</FieldLabel><Input id="email" type="email"/></Field><Field><FieldLabel htmlFor="password">Contraseña</FieldLabel><Input id="password" type="password"/></Field><Button asChild size="lg" className="w-full"><Link href="/mi-cuenta">Crear cuenta</Link></Button><p className="text-center text-sm text-muted-foreground">¿Ya tenés cuenta? <Link href="/ingresar" className="font-semibold underline">Ingresar</Link></p></FieldGroup></CardContent></Card></main>}
