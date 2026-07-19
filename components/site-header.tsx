'use client'

import Link from 'next/link'
import { Menu, ShoppingBag, UserRound } from 'lucide-react'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const links = [['Productos','/productos'],['Préstamos','/prestamos/solicitar'],['Mi cuenta','/mi-cuenta'],['Administración','/admin']]

export function SiteHeader() {
  return <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"><Brand/><nav className="hidden items-center gap-7 md:flex" aria-label="Navegación principal">{links.map(([label,href])=><Link key={href} href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{label}</Link>)}</nav><div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Bolsa"><ShoppingBag/></Button><Button asChild className="hidden sm:inline-flex"><Link href="/ingresar"><UserRound data-icon="inline-start"/>Ingresar</Link></Button><Sheet><SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" aria-label="Abrir menú"><Menu/></Button>}/><SheetContent><SheetHeader><SheetTitle><Brand/></SheetTitle></SheetHeader><nav className="flex flex-col gap-2 px-4">{links.map(([label,href])=><Button key={href} asChild variant="ghost" className="justify-start"><Link href={href}>{label}</Link></Button>)}</nav></SheetContent></Sheet></div></div></header>
}
