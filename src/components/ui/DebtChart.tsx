"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart } from "recharts"
import type { ChartConfig } from "@/components/shadcn-ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn-ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn-ui/chart"
import type { Debt } from "./DebtForm"
import { useEffect } from "react"

interface DebtChartProps {
  debts: Debt[]
}

function DebtChart({ debts }: DebtChartProps) {

  const calculateDebtTotals = (debts: Debt[]) => {
    let paidTotal = 0;
    let unpaidTotal = 0;
    let pendingTotal = 0;

    debts.forEach((debt) => {
      if (debt.status === 'paid') paidTotal += Number(debt.amount)
      else if (debt.status === 'unpaid') unpaidTotal += Number(debt.amount)
      else if (debt.status === 'pending') pendingTotal += Number(debt.amount)
    });
    return { paidTotal, unpaidTotal, pendingTotal }
  }
  
  const { paidTotal, unpaidTotal, pendingTotal } = calculateDebtTotals(debts)

  const chartData = [
    { status: "paid", amount: paidTotal, fill: "#4ade80" },
    { status: "owed", amount: unpaidTotal, fill: "#f87171" },
    { status: "pending", amount: pendingTotal, fill: "#facc15" },
  ]
  
  const chartConfig = {
    paid: { label: "Paid", color: "#4ade80" },
    pending: { label: "Pending", color: "#facc15" },
    owed: { label: "Owed", color: "#f87171" },
  } satisfies ChartConfig

  return (
    <Card className="flex-1 flex-col p-4 rounded-lg shadow">
      <CardHeader className="items-center pb-0">
        <CardTitle>Debt total</CardTitle>
        <CardDescription>2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
          <Pie 
          data={chartData}
          dataKey="amount"
          nameKey="status"
          outerRadius={120}
          labelLine={false}
          label={({ value }) => `£${value}`}
          >
            <LabelList
              dataKey="status"
              stroke="none"
              fontSize={14}
              fill="#000"
              formatter={(value: keyof typeof chartConfig) =>
                chartConfig[value]?.label
              }
            />
          </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          You have ${unpaidTotal} left to pay <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Based on financial data from the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}

export default DebtChart