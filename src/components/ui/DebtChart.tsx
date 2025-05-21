"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart } from "recharts"
import type { ChartConfig } from "@/components/shadcn-ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn-ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn-ui/chart"

const chartData = [
  { status: "paid", amount: 300, fill: "#4ade80" },
  { status: "pending", amount: 150, fill: "#facc15" },
  { status: "owed", amount: 100, fill: "#f87171" },
]

const chartConfig = {
  paid: { label: "Paid", color: "#4ade80" },
  pending: { label: "Pending", color: "#facc15" },
  owed: { label: "Owed", color: "#f87171" },
} satisfies ChartConfig


function DebtChart() {
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
          You have $200 left to pay <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Based on financial data from the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}

export default DebtChart