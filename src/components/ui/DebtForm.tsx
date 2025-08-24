"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/shadcn-ui/form"
import { Input } from "@/components/shadcn-ui/input"
import { Button } from "@/components/shadcn-ui/button"
import { Textarea } from "@/components/shadcn-ui/textarea"
import { supabase } from "../../../supabaseClient"
import type { Session } from "@supabase/supabase-js"
import type { User } from "../Dashboard"
import { useState } from "react"
import { toast } from "sonner"

// Schema to validate the debt form input
const formSchema = z.object({
  id: z.string().uuid().optional(),
  borrower_name: z.string().min(1, "Name is required"),
  borrower_id: z.string().uuid().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["pending", "paid", "unpaid"]),
  lender_name: z.string().optional(),
  lender_id: z.string().uuid().optional(),
})

export type Debt = z.infer<typeof formSchema>

interface DebtFormProps {
  session: Session | null;
  onDebtAdded: () => void;
  allUsers: User[]
}

function DebtForm({ session, onDebtAdded, allUsers }: DebtFormProps) {

  const [searchTerm, setSearchTerm] = useState("")
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
      defaultValues: {
      borrower_name: "",
      amount: "",
      description: "",
      due_date: "",
      status: "unpaid",
    },
  })

  // Add new debt entry 
  const addNewDebt = async (newDebt: Debt) => {
    if (!session?.user) return;

    const { error } = await supabase
    .from("debts")
    .insert([{ 
      ...newDebt,
      lender_id: session?.user?.id, 
      lender_name: session?.user?.user_metadata.full_name,
    }]);
    
    if (error) {
      console.error("Error adding new debt")
      return;
    }
    
    toast.success(`You have assigned a new debt to ${newDebt.borrower_name}`);

    onDebtAdded();
    form.reset();
    setSearchTerm("");

    // Fetch borrower FCM Token
    const { data: borrower } = await supabase.from("profiles").select("id, first_name, last_name, fcm_token").eq("id", newDebt.borrower_id).single();

    if (!borrower) return;

    console.log('Borrower info:', borrower);
            
    // Inserting into custom notifications table
    const { data: newNotification } = await supabase.from("notifications").insert([{
      user_id: borrower.id,
      title: "New debt assigned",
      body: `${session.user.user_metadata.full_name} assigned you a new debt.`,
      read: false,
      type: "new_debt"
    }]);

    if (borrower?.fcm_token) {
      await fetch("http://localhost:4000/send-notification", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: borrower.fcm_token,
          title: "New debt",
          message: `You have assigned a new debt to ${borrower.first_name} ${borrower.last_name}.`,
          link: "http://localhost:5173"
        }),
      });
    }
  }

  // Filter users by first name, case-sensitive match with search term
  const filteredUsers = allUsers.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(addNewDebt)} className="flex-1 p-4 rounded-lg shadow space-y-4">
      <FormField
          control={form.control}
          name="borrower_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
              <div>
                <Input 
                className="w-full border p-2 rounded-md"
                placeholder="Who is this for?" {...field}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  form.setValue("borrower_name", e.target.value)
                  }}
                autoComplete="off"
                />
                {searchTerm && searchTerm.length > 2 && (
                <ul>
                  {filteredUsers.map(user => (
                    <li className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 hover:text-orange-400 rounded-lg" key={user.id} onClick={() => {
                      form.setValue("borrower_id", user.id.toString())
                      form.setValue("borrower_name", `${user.first_name} ${user.last_name}`)
                      setSearchTerm(`${user.first_name} ${user.last_name}`)
                    }}>
                      {`${user.first_name} ${user.last_name}`}
                    </li>
                  ))}
                </ul>
              )}
              </div>
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
                  <option value="unpaid">Unpaid</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
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