import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
} from "chart.js";
import "./App.css";
import { Link } from "react-router-dom";
import { useStats } from "./StatsContext";


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement);

const socket = io("http://localhost:5000");

function App() {
  const [packageName, setPackageName] = useState("");
  const { stats, setStats,name ,setName } = useStats(); // Use the context
  const [baseDownloads, setBaseDownloads] = useState(0);
  const [chartData, setChartData] = useState({ labels: [], dataPoints: [] });
  const [rateData, setRateData] = useState({ labels: [], rates: [] });
  const [loading, setLoading] = useState(false);

  const trackPackage = () => {
    setLoading(true);
    if (packageName) {
      setName(packageName);

      socket.emit("trackPackage", packageName);
      setChartData({ labels: [], dataPoints: [] });
      setRateData({ labels: [], rates: [] });
    }
  };

  useEffect(() => {
    socket.on("packageUpdate", (data) => {
      setStats(data);
      setLoading(false);

      setBaseDownloads((prevBaseDownloads) =>
        prevBaseDownloads === 0 ? data.baseDownloads : prevBaseDownloads
      );

      setChartData((prev) => {
        const newTime = new Date().toLocaleTimeString();
        const newDownloadValue = prev.dataPoints.length
          ? prev.dataPoints[prev.dataPoints.length - 1] + 10 + Math.floor(Math.random() * 5)
          : data.estimatedDownloads;
        return {
          labels: [...prev.labels, newTime].slice(-30),
          dataPoints: [...prev.dataPoints, newDownloadValue].slice(-30),
        };
      });

      setRateData((prev) => {
        const newTime = new Date().toLocaleTimeString();
        const lastRate = prev.rates.length > 0 ? prev.rates[prev.rates.length - 1] : 0;
        const newRate = Math.random() * 3 + lastRate * 0.9;
        return {
          labels: [...prev.labels, newTime].slice(-30),
          rates: [...prev.rates, Number(newRate.toFixed(2))].slice(-30),
        };
      });
    });

    return () => {
      socket.off("packageUpdate");
    };
  }, []);

  const incrementalDownloads =
    stats && baseDownloads ? stats.estimatedDownloads - baseDownloads : 0;

  const dataPoints = chartData.dataPoints;
  const minDownload = dataPoints.length ? Math.min(...dataPoints) : 0;
  const maxDownload = dataPoints.length ? Math.max(...dataPoints) : 0;
  const margin = maxDownload - minDownload > 0 ? (maxDownload - minDownload) * 0.1 : 10;

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold uppercase">Stat-Pac</h1>
        <p className="mt-2 text-lg text-gray-300">
          Monitor Downloads &amp; Package Details in Real Time
        </p>
      </header>

      <div className="max-w-md mx-auto">
        <div className="flex gap-3">
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Enter package name"
            className="flex-1 p-3 rounded border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={trackPackage}
            
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded uppercase font-bold shadow-lg transition"
          >
            Track
          </button>
        </div>
      </div>
      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center my-4">
          <img
            src="/tube-spinner.svg"
            alt="Loading..."
            className="w-20 h-20 animate-spin"
          />
        </div>
      )}

      {/* Error Message */}
      {!loading && !stats && (
        <p className="text-red-500 text-center mt-4">No data available</p>
      )}

      {/* Package Info Cards */}
      {stats && (
        <div className="mt-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">Estimated Downloads</h3>
            <p className="text-lg">{stats.estimatedDownloads}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">Weekly Downloads</h3>
            <p className="text-lg">{stats.weeklyDownloads}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">Total Downloads</h3>
            <p className="text-lg">{stats.totalDownloads}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">License</h3>
            <p className="text-lg">{stats.license}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">Current Version</h3>
            <p className="text-lg">{stats.currentVersion}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">Last Published</h3>
            <p className="text-lg">{new Date(stats.lastPublished).toLocaleDateString()}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">Maintainers</h3>
            <p className="text-lg">
              {stats.maintainers &&
                stats.maintainers.map((m) => m.username || m.name).join(", ")}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold uppercase mb-2">Repository</h3>
            <p className="text-lg">
              <a
                href={stats.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {stats.repository}
              </a>
            </p>
          </div>
          <Link to="/versions"  >
         
            <div className="bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-bold uppercase mb-2">All Versions</h3>
             
            </div>
          </Link>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 md:col-span-2">
            <h3 className="text-xl font-bold uppercase mb-2">Description</h3>
            <p className="text-lg">{stats.description}</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Total Downloads Line Chart */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold uppercase text-center mb-4">Total Downloads</h2>
          <div className="h-72">
            <Line
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: "Estimated Downloads",
                    data: chartData.dataPoints,
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                scales: {
                  x: { title: { display: true, text: "Time" } },
                  y: {
                    title: { display: true, text: "Downloads" },
                    min: minDownload,
                    max: maxDownload + margin,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Download Rate Line Chart */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold uppercase text-center mb-4">
            Download Rate (per second)
          </h2>
          <div className="h-60">
            <Line
              data={{
                labels: rateData.labels,
                datasets: [
                  {
                    label: "Download Rate",
                    data: rateData.rates,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                scales: {
                  x: { title: { display: true, text: "Time" } },
                  y: {
                    title: { display: true, text: "Downloads per sec" },
                    suggestedMin: 0,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Downloads Breakdown Pie Chart */}
        {stats && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-bold uppercase text-center mb-4">
              Downloads Breakdown
            </h2>
            <div className="h-72">
              <Pie
                data={{
                  labels: ["Base Downloads", "New Downloads"],
                  datasets: [
                    {
                      data: [baseDownloads, incrementalDownloads],
                      backgroundColor: ["rgb(54, 162, 235)", "rgb(255, 206, 86)"],
                      hoverBackgroundColor: ["rgb(54, 162, 235)", "rgb(255, 206, 86)"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 500 },
                }}
              />
            </div>
          </div>
        )}

        {/* Package Metrics Pie Chart */}
        {stats && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-bold uppercase text-center mb-4">
              Package Metrics
            </h2>
            <div className="h-72">
              <Pie
                data={{
                  labels: ["Maintenance", "Popularity", "Quality"],
                  datasets: [
                    {
                      data: [
                        stats.maintenance || 0,
                        stats.popularity || 0,
                        stats.quality || 0,
                      ],
                      backgroundColor: [
                        "rgb(153, 102, 255)",
                        "rgb(255, 159, 64)",
                        "rgb(75, 192, 192)",
                      ],
                      hoverBackgroundColor: [
                        "rgb(153, 102, 255)",
                        "rgb(255, 159, 64)",
                        "rgb(75, 192, 192)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 500 },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
