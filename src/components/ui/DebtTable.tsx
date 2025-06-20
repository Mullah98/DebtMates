import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table"
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectValue } from "@/components/shadcn-ui/select"
import type { Debt } from "./DebtForm"
import { supabase } from "../../../supabaseClient"
import { FaTrash } from 'react-icons/fa';


interface DebtTableProps {
  allDebts: Debt[];
  onDebtAdded: () => void;
}

function DebtTable({ allDebts, onDebtAdded }: DebtTableProps) {

  const formatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    hour12: true
  })

  //Function to update debt status
  const updateDebt = async (debt: Debt, newStatus: string) => {
    const { error } = await supabase
    .from("debts")
    .update({ status: newStatus})
    .eq("id", debt.id)

    if (error) {
      console.error("Unable to update the debt status", error)
    } else {
      onDebtAdded()
    }
  }

  //Function to delete user debts
  const deleteDebt = async (debt: Debt) => {    
    const {error} = await supabase
    .from("debts")
    .delete()
    .eq("id", debt.id)

    if (error) {
      console.error('Could not delete debt', error)
    } else {
      onDebtAdded();
    }
  }

  return (
    <div className="p-4 rounded-lg shadow">
    <Table>
    <TableCaption>{allDebts.length !== 0 ? 'A list of your recent debts.' : 'You have no debts at this moment.'}</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Name</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        <TableHead className="text-right">Due Date</TableHead>
        <TableHead className="text-center">Status</TableHead>
        <TableHead className="text-center">Description</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
    {allDebts?.map((debt) => (
      <TableRow key={debt.id}>
          <TableCell className="px-2 text-left font-medium">{debt.borrower_name}</TableCell>
          <TableCell className="px-2 text-right">${debt.amount}</TableCell>
          <TableCell className="px-2 text-right">{formatter.format(new Date(debt.due_date))}</TableCell>
          <TableCell className="px-2 text-right">
          <div className="flex justify-center">
          <Select value={debt.status} onValueChange={(value) => updateDebt(debt, value)}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="paid">
                  <div className="flex items-center gap-2 text-green-500">
                    <span className="w-3 h-3 rounded-full shadow-md bg-green-500"></span>
                    Paid
                  </div>
                </SelectItem>
                <SelectItem value="unpaid">
                  <div className="flex items-center gap-2 text-red-500">
                    <span className="w-3 h-3 rounded-full shadow-md bg-red-500"></span>
                    Unpaid
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2 text-orange-500">
                    <span className="w-3 h-3 rounded-full shadow-md bg-orange-500"></span>
                    Pending
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select> 
          </div>
          </TableCell>
          <TableCell className="px-2 text-center">{debt.description}</TableCell>
          <TableCell><button onClick={() => deleteDebt(debt)}><FaTrash color="red" /></button></TableCell>
      </TableRow>
      ))}
    </TableBody>
    </Table>
    </div>
  )
}

export default DebtTable
