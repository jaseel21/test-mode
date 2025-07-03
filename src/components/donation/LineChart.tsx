"use client";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const LineChart = () => {
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [
      {
        label: "Donations",
        data: [],
        fill: true,
        backgroundColor: "rgba(52, 211, 153, 0.1)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgba(16, 185, 129, 1)",
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // Fetch donations from the API
        const response = await fetch("/api/list-recent-donations",
          {
            headers: {
              'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            },
          }
        );
        const result = await response.json();

        if (!result.success) {
          console.error("Failed to fetch donations:", result.message);
          return;
        }

        const donations = result.donations;

        // Process donations to aggregate by month
        const monthlyTotals: { [key: string]: number } = {};
        donations.forEach((donation: { createdAt: string; amount: number }) => {
          const date = new Date(donation.createdAt);
          const monthYear = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }); // e.g., "January 2025"
          monthlyTotals[monthYear] =
            (monthlyTotals[monthYear] || 0) + donation.amount;
        });

        // Sort months chronologically
        const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateA.getTime() - dateB.getTime();
        });

        // Limit to the last 7 months for display
        const recentMonths = sortedMonths.slice(-7);
        const labels = recentMonths.map((month) =>
          month.split(" ")[0]
        ); // e.g., ["January", "February", ...]
        const data = recentMonths.map((month) => monthlyTotals[month]);

        // Update chart data
        setChartData({
          labels,
          datasets: [
            {
              label: "Donations",
              data,
              fill: true,
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "rgba(16, 185, 129, 1)",
              pointBorderColor: "white",
              pointBorderWidth: 2,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "rgba(16, 185, 129, 1)",
              pointHoverBorderColor: "white",
              pointHoverBorderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching donations:", error);
      }
    };

    fetchDonations();
  }, []);

  const options: ChartOptions<"line"> = {
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
          Donation Trends
        </h2>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Monthly donation patterns over time
        </p>
      </div>
      <div className="w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChart;