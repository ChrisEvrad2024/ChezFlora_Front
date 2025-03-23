
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface StatData {
  name: string;
  value: number;
}

interface StatisticsWidgetProps {
  title: string;
  data: StatData[];
  color?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  chartType?: 'bar' | 'line' | 'pie';
}

export function StatisticsWidget({ 
  title, 
  data, 
  color = '#4f46e5', 
  valuePrefix = '', 
  valueSuffix = '',
  chartType = 'bar'
}: StatisticsWidgetProps) {
  // COLORS array for pie chart segments
  const COLORS = ['#4f46e5', '#22c55e', '#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6'];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${valuePrefix}${value}${valueSuffix}`}
            />
            <Tooltip 
              formatter={(value) => [`${valuePrefix}${value}${valueSuffix}`, '']}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2} 
              dot={{ r: 3 }} 
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={color}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${valuePrefix}${value}${valueSuffix}`, '']}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              }}
            />
          </PieChart>
        );
      
      default: // bar chart
        return (
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${valuePrefix}${value}${valueSuffix}`}
            />
            <Tooltip 
              formatter={(value) => [`${valuePrefix}${value}${valueSuffix}`, '']}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'increase',
  changeLabel
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  change?: string | number; 
  changeType?: 'increase' | 'decrease';
  changeLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            {change && (
              <p className={`text-xs font-medium mt-1 flex items-center ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '↑' : '↓'} {change}
                {changeLabel && <span className="text-muted-foreground ml-1">({changeLabel})</span>}
              </p>
            )}
          </div>
          <div className="rounded-full bg-muted w-10 h-10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
