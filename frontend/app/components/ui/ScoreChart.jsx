"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function ScoreChart({ score }) {

  const data = {
    labels: ["Overall Score"],
    datasets: [
      {
        label: "Score",
        data: [score],
        backgroundColor: "rgba(168,85,247,0.8)"
      }
    ]
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <Bar data={data} />
    </div>
  );
}