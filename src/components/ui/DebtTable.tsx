import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table"
import type { Debt } from "./DebtForm"

interface DebtTableProps {
  allDebts: Debt[]
}

function DebtTable({ allDebts }: DebtTableProps) {

  const formatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true
  })

  return (
    <div className="p-4 rounded-lg shadow">
    <Table>
    <TableCaption>{allDebts.length !== 0 ? 'A list of your recent debts.' : 'You have no debts at this moment.'}</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Name</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        <TableHead className="text-right">Due Date</TableHead>
        <TableHead className="text-right">Status</TableHead>
        <TableHead className="text-right">Description</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
    {allDebts?.map((debt) => (
      <TableRow key={debt.id}>
          <TableCell className="px-2 text-left font-medium">{debt.borrower_name}</TableCell>
          <TableCell className="px-2 text-right">${debt.amount}</TableCell>
          <TableCell className="px-2 text-right">{formatter.format(new Date(debt.due_date))}</TableCell>
          <TableCell className="px-2 text-right">{debt.status}</TableCell>
          <TableCell className="px-2 text-right">{debt.description}</TableCell>
      </TableRow>
      ))}
    </TableBody>
    </Table>
    </div>
  )
}

export default DebtTable
