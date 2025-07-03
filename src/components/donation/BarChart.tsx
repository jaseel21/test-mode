"use client"
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const BarChart = () => {
  const data: ChartData<"bar"> = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Donations",
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: "rgba(52, 211, 153, 0.8)", // Emerald with opacity
        hoverBackgroundColor: "rgba(16, 185, 129, 1)", // Darker on hover
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 32,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          color: "rgba(0, 0, 0, 0.8)",
          font: {
            size: 14,
            weight: "bold",
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: "rgba(0, 0, 0, 0.6)",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: "rgba(0, 0, 0, 0.6)",
        },
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-lg shadow-xl max-w-2xl mx-auto p-6">
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200">
          Monthly Donations
        </h2>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Donation distribution by month
        </p>
      </div>
      <div className="w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarChart;