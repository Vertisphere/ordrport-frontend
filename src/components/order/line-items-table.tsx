import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineItem } from "@/types/entities"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LineItemsTableProps {
  items: LineItem[]
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export function LineItemsTable({ items, onQuantityChange, onRemoveItem }: LineItemsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((lineItem) => (
          <TableRow key={lineItem.item.Id}>
            <TableCell>{lineItem.item.Id}</TableCell>
            <TableCell>{lineItem.item.Name}</TableCell>
            <TableCell>
              <Input
                type="number"
                value={lineItem.quantity}
                onChange={(e) => onQuantityChange(lineItem.item.Id, parseInt(e.target.value))}
                className="w-20"
                min={1}
              />
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(lineItem.item.Id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 