import { Mail, Pencil, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ClienteFila, EstadoResumen } from '@/lib/consultas'
import { EliminarCliente } from './eliminar-cliente'
import { ETIQUETA_MEDIO, FormCliente } from './form-cliente'
import { SelectorEstado } from './selector-estado'

const enlace =
  'flex items-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function TablaClientes({ filas, estados }: { filas: ClienteFila[]; estados: EstadoResumen[] }) {
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Cliente</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Giro</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Seguimiento</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((c) => (
            <TableRow key={c.id} className="group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-foreground"
                  >
                    {c.empresa.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{c.empresa}</p>
                    <p className="text-xs text-muted-foreground">{c.nombre}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-[13px]">
                  {c.celular && (
                    <a href={`tel:${c.celular}`} className={enlace}>
                      <Phone className="size-3.5" aria-hidden />
                      {c.celular}
                    </a>
                  )}
                  {c.correo && (
                    <a href={`mailto:${c.correo}`} className={enlace}>
                      <Mail className="size-3.5" aria-hidden />
                      {c.correo}
                    </a>
                  )}
                  {!c.celular && !c.correo && <span className="text-muted-foreground/70">Sin datos de contacto</span>}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{c.giro}</TableCell>
              <TableCell>
                <SelectorEstado
                  key={c.estado_id}
                  clienteId={c.id}
                  nombreCliente={c.empresa}
                  estadoId={c.estado_id}
                  estados={estados}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-[13px]">
                  <p>
                    <span className="text-muted-foreground">Por </span>
                    <span className="font-medium">{c.contactado_por}</span>
                  </p>
                  <p className="text-muted-foreground">vía {ETIQUETA_MEDIO[c.medio_contacto]?.toLowerCase()}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1 opacity-70 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                  <FormCliente
                    estados={estados}
                    cliente={c}
                    disparador={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl"
                        aria-label={`Editar ${c.empresa}`}
                        title="Editar"
                      >
                        <Pencil />
                      </Button>
                    }
                  />
                  <EliminarCliente id={c.id} nombre={c.empresa} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
