import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ClienteFila, EstadoResumen } from '@/lib/consultas'
import { EliminarCliente } from './eliminar-cliente'
import { ETIQUETA_MEDIO, FormCliente } from './form-cliente'
import { SelectorEstado } from './selector-estado'

const vacio = <span className="text-muted-foreground">—</span>

export function TablaClientes({ filas, estados }: { filas: ClienteFila[]; estados: EstadoResumen[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Giro</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Medio</TableHead>
            <TableHead>Contactado por</TableHead>
            <TableHead className="sr-only">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.nombre}</TableCell>
              <TableCell>{c.empresa ?? vacio}</TableCell>
              <TableCell>{c.celular ? <a href={`tel:${c.celular}`}>{c.celular}</a> : vacio}</TableCell>
              <TableCell>{c.correo ? <a href={`mailto:${c.correo}`}>{c.correo}</a> : vacio}</TableCell>
              <TableCell>{c.giro ?? vacio}</TableCell>
              <TableCell>
                <SelectorEstado key={c.estado_id} clienteId={c.id} nombreCliente={c.nombre} estadoId={c.estado_id} estados={estados} />
              </TableCell>
              <TableCell>{c.medio_contacto ? ETIQUETA_MEDIO[c.medio_contacto] : vacio}</TableCell>
              <TableCell>{c.contactado_por ?? vacio}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <FormCliente
                    estados={estados}
                    cliente={c}
                    disparador={
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    }
                  />
                  <EliminarCliente id={c.id} nombre={c.nombre} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
