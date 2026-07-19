'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/data'

const categories=['Todos','Muebles','Iluminación','Textiles']
export default function ProductsPage(){const [query,setQuery]=useState('');const [category,setCategory]=useState('Todos');const filtered=useMemo(()=>products.filter(p=>(category==='Todos'||p.category===category)&&p.name.toLowerCase().includes(query.toLowerCase())),[query,category]);return <><SiteHeader/><main><section className="bg-brand-navy px-5 py-16 text-center text-brand-cream"><p className="text-xs font-semibold uppercase tracking-[.3em] text-primary">Catálogo</p><h1 className="mt-3 font-serif text-5xl">Objetos para habitar mejor</h1><p className="mx-auto mt-4 max-w-xl leading-relaxed text-brand-cream/65">Una selección corta y cuidada para crear espacios con identidad.</p></section><section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="mb-10 flex flex-col gap-5 border-b pb-8 md:flex-row md:items-center md:justify-between"><label className="relative w-full max-w-md"><span className="sr-only">Buscar productos</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre..." className="pl-9"/></label><div className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">{categories.map(c=><Button key={c} variant={category===c?'default':'outline'} size="sm" onClick={()=>setCategory(c)}>{c}</Button>)}</div></div><p className="mb-6 text-sm text-muted-foreground">{filtered.length} productos encontrados</p>{filtered.length?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="rounded-xl border border-dashed p-12 text-center"><h2 className="font-serif text-2xl">No encontramos resultados</h2><p className="mt-2 text-sm text-muted-foreground">Probá con otra búsqueda o categoría.</p></div>}</section></main><SiteFooter/></>}
