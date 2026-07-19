import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { type Product, formatARS, installments } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ProductCard({ product }: { product: Product }) { return <Card className="group overflow-hidden border-border/70 bg-card py-0 shadow-none transition-all hover:-translate-y-1 hover:shadow-xl"><Link href={`/productos/${product.id}`} className="relative aspect-[4/3] overflow-hidden"><Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw"/><Badge className="absolute left-4 top-4">{product.category}</Badge></Link><CardContent className="flex flex-col gap-2 px-5 pt-5"><h3 className="font-serif text-2xl">{product.name}</h3><p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p><p className="mt-2 text-lg font-semibold">{formatARS(product.price)}</p><p className="text-xs text-muted-foreground">12 cuotas desde {formatARS(installments(product.price))}</p></CardContent><CardFooter className="px-5 pb-5"><Button asChild variant="outline" className="w-full"><Link href={`/productos/${product.id}`}>Ver detalle <ArrowUpRight data-icon="inline-end"/></Link></Button></CardFooter></Card> }
