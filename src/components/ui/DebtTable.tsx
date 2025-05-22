import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table"

interface Debt {
  name: string
  amount: number
  due_date: string | number
  status: string
  description: string
}

function DebtTable() {
  const debttable: Debt[] = [
  {name: 'John', amount: 340, due_date: '12th June', status: 'Not paid', description: 'Breakfest at Mikes'},
  {name: 'Holly', amount: 20, due_date: '30th June', status: 'Pending', description: 'Sharing a cab'},
  {name: 'Sam', amount: 1200, due_date: '31st October', status: 'Paid', description: 'Spoiler for the BMW'}
]

  return (
    <div className="p-4 rounded-lg shadow">
    <Table>
    <TableCaption>A list of your recent invoices.</TableCaption>
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
    {debttable.map(debt => (
      <TableRow>
          <TableCell className="px-2 text-left font-medium">{debt.name}</TableCell>
          <TableCell className="px-2 text-right">${debt.amount}</TableCell>
          <TableCell className="px-2 text-right">{debt.due_date}</TableCell>
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
