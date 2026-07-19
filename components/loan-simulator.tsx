'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator } from 'lucide-react'
import { formatARS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

export function LoanSimulator(){const [amount,setAmount]=useState(600000);const [months,setMonths]=useState(12);const payment=Math.round((amount*(1+months*0.015))/months);return <Card className="border-primary/25 bg-card shadow-2xl"><CardHeader><div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary"><Calculator/></div><CardTitle className="font-serif text-3xl">Tu proyecto, en cuotas</CardTitle><p className="text-sm leading-relaxed text-muted-foreground">Simulá una financiación orientativa y elegí una opción cómoda para vos.</p></CardHeader><CardContent className="flex flex-col gap-7"><div className="flex flex-col gap-3"><div className="flex justify-between text-sm"><span>Monto</span><strong>{formatARS(amount)}</strong></div><Slider value={[amount]} min={100000} max={2000000} step={50000} onValueChange={([v])=>setAmount(v)}/></div><div className="flex flex-col gap-3"><div className="flex justify-between text-sm"><span>Plazo</span><strong>{months} meses</strong></div><Slider value={[months]} min={3} max={24} step={3} onValueChange={([v])=>setMonths(v)}/></div><div className="rounded-xl bg-secondary p-5 text-center"><p className="text-xs uppercase tracking-widest text-muted-foreground">Cuota estimada</p><p className="mt-1 font-serif text-4xl text-foreground">{formatARS(payment)}</p><p className="mt-2 text-xs text-muted-foreground">Tasa orientativa. Sujeto a evaluación.</p></div><Button asChild size="lg"><Link href="/prestamos/solicitar">Iniciar solicitud</Link></Button></CardContent></Card>}
