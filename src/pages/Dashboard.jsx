import React, { useState, useEffect } from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { API_URL } from '../constant';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
    const [monthlyData, setMonthlyData] = useState({
        labels: [],
        datasets: []
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMonthlyLendings();
    }, []);

    const fetchMonthlyLendings = () => {
        const token = localStorage.getItem('access_token');
        axios.get(`${API_URL}/peminjaman`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const lendings = res.data.data || res.data;
            processMonthlyData(lendings);
        })
        .catch(err => {
            setError("Failed to fetch lending data");
        });
    };

    const processMonthlyData = (lendings) => {
        // Create a map to store monthly counts
        const monthlyCount = {};
        
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
            'July', 'Aug', 'sep', 'Oct', 'Nov', 'Dec'
        ];
        
        // Process each lending
        lendings.forEach(lending => {
            const date = new Date(lending.tgl_pinjam);
            const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            
            monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
        });

        // Prepare data for chart
        const labels = Object.keys(monthlyCount).sort((a, b) => {
            const [aMonth, aYear] = a.split(' ');
            const [bMonth, bYear] = b.split(' ');
            return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
        });
        const data = labels.map(month => monthlyCount[month]);

        setMonthlyData({
            labels,
            datasets: [{
                label: 'Number of Lendings',
                data,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                borderColor: 'rgb(53, 162, 235)',
                borderWidth: 1,
            }]
        });
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Lending Statistics',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-5">Dashboard</h1>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="card">
                <div className="card-body">
                    <Bar options={options} data={monthlyData} />
                </div>
            </div>
        </div>
    );
}