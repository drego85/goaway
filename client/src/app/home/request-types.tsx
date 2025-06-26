"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { GetRequest } from "@/util";
import { SetStateAction, useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart
} from "recharts";

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)"
];

type QueryType = {
  count: number;
  queryType: string;
};

export default function RequestTypeChart() {
  const [chartData, setChartData] = useState<QueryType[]>([]);
  const [chartType, setChartType] = useState("radar");

  useEffect(() => {
    async function fetchQueryTypes() {
      try {
        const [, data] = await GetRequest("queryTypes");
        if (!data.queries || !Array.isArray(data.queries)) {
          return;
        }

        const formattedData = data.queries.map(
          (request: QueryType, index: number) => ({
            count: request.count,
            queryType: request.queryType,
            fill: colors[index % colors.length]
          })
        );

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch query types:", error);
      }
    }

    fetchQueryTypes();
    const interval = setInterval(fetchQueryTypes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChartTypeChange = (value: SetStateAction<string>) => {
    setChartType(value);
  };

  return (
    <Card className="lg:w-3/8">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between w-full">
          <CardTitle>Request Types</CardTitle>
          <Select value={chartType} onValueChange={handleChartTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radar">Radar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      {chartData.length > 0 && (
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-1 px-4">
          {chartData.map((item: QueryType) => (
            <div
              key={item.queryType}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs font-medium text-foreground">
                {item.queryType}
              </span>
              <span className="text-xs text-muted-foreground">
                ({item.count})
              </span>
            </div>
          ))}
        </div>
      )}
      {chartData.length > 0 ? (
        <CardContent className="flex-1 pb-0">
          {chartType === "radar" ? (
            <ChartContainer config={{}}>
              <RadarChart data={chartData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarGrid />
                <PolarAngleAxis dataKey="requestType" />
                <Radar
                  dataKey="count"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </RadarChart>
            </ChartContainer>
          ) : (
            <ChartContainer
              config={{}}
              className="[&_.recharts-pie-label-text]:fill-foreground"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="count"
                  label
                  nameKey="requestType"
                />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      ) : (
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm text-muted-foreground">
              No query types has yet been identified
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
