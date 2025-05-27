"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/shadcn-ui/form"
import { Input } from "@/components/shadcn-ui/input"
import { Button } from "@/components/shadcn-ui/button"
import { Textarea } from "@/components/shadcn-ui/textarea"
import { useState } from "react"
import { supabase } from "../../../supabaseClient"
import type { Session } from "@supabase/supabase-js"

// Schema to validate the debt form input
const formSchema = z.object({
  borrower_name: z.string().min(1, "Name is required"),
  borrower_id: z.string().uuid().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["pending", "paid", "overdue"]),
})

type Debt = z.infer<typeof formSchema>

interface DebtFormProps {
  session: Session | null
}

function DebtForm({ session }: DebtFormProps) {
  const [allDebts, setAllDebts] = useState<Debt[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
      defaultValues: {
      borrower_name: "",
      amount: "",
      description: "",
      due_date: "",
      status: "pending",
    },
  })

  // Adds new debt entry to Supabase 'debts' table
  const addDebt = async (newDebt: Debt) => {
    if (session?.user) {
      const { error } = await supabase
      .from("debts")
      .insert([{...newDebt, lender_id: session.user.id}])

      if (error) {
        console.error("Error adding new debt", error)
      } else {
        console.log(newDebt);
        setAllDebts(prev => [...prev, newDebt])
        form.reset();
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(addDebt)} className="flex-1 p-4 rounded-lg shadow space-y-4">
      <FormField
          control={form.control}
          name="borrower_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
              <Input placeholder="Who is this for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (£)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What is this debt for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select {...field} className="w-full border p-2 rounded-md">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Debt</Button>
      </form>
    </Form>
  )
}

export default DebtForm