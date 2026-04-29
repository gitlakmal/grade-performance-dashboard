import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraphDashboard = ({ data, title }) => {
  const [activeTab, setActiveTab] = useState('All');

  // 1. New State to store the currently hovered data
  const [hoveredData, setHoveredData] = useState(null);

  const coreKeywords = ['English', 'History', 'Mathematics', 'Science', 'Sinhala', 'Tamil'];
  const allSubjects = Object.keys(data);
  const coreSubjects = [];
  const electiveSubjects = [];

  allSubjects.forEach(sub => {
    if (sub.toLowerCase().includes('literature') || sub.toLowerCase().includes('health')) {
      electiveSubjects.push(sub);
    } else if (coreKeywords.some(key => sub.toLowerCase().includes(key.toLowerCase()))) {
      coreSubjects.push(sub);
    } else {
      electiveSubjects.push(sub);
    }
  });

  let displayedSubjects = [];
  if (activeTab === 'Core') displayedSubjects = coreSubjects;
  else if (activeTab === 'Elective') displayedSubjects = electiveSubjects;
  else displayedSubjects = allSubjects;

  const validSubjects = displayedSubjects.filter(sub =>
    data[sub].reduce((sum, val) => sum + val, 0) > 0
  );

  const labelsWithTotals = validSubjects.map(sub => {
    const total = data[sub].reduce((sum, val) => sum + val, 0);
    return `${sub} (${total})`;
  });

  const chartConfig = {
    labels: labelsWithTotals,
    datasets: [
      { label: '0-34', data: validSubjects.map(s => data[s][0]), backgroundColor: '#cc0000' },
      { label: '35-49', data: validSubjects.map(s => data[s][1]), backgroundColor: '#e69138' },
      { label: '50-64', data: validSubjects.map(s => data[s][2]), backgroundColor: '#f1c232' },
      { label: '65-74', data: validSubjects.map(s => data[s][3]), backgroundColor: '#93c47d' },
      { label: '75-100', data: validSubjects.map(s => data[s][4]), backgroundColor: '#38761d' },
    ],
  };

  const scoreRanges = [
    { label: '75-100', index: 4, bg: '#38761d', color: 'white' },
    { label: '65-74', index: 3, bg: '#93c47d', color: 'black' },
    { label: '50-64', index: 2, bg: '#f1c232', color: 'black' },
    { label: '35-49', index: 1, bg: '#e69138', color: 'white' },
    { label: '0-34', index: 0, bg: '#cc0000', color: 'white' }
  ];

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '90vh', background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '15px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>{title}</h2>
        <div className="tabs-menu" style={{ borderBottom: 'none', margin: 0, padding: 0 }}>
          <button className={activeTab === 'Core' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('Core')} style={{ padding: '5px 15px', fontSize: '14px' }}>Core</button>
          <button className={activeTab === 'Elective' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('Elective')} style={{ padding: '5px 15px', fontSize: '14px' }}>Elective</button>
          <button className={activeTab === 'All' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('All')} style={{ padding: '5px 15px', fontSize: '14px' }}>All</button>
        </div>
      </div>

      {validSubjects.length === 0 ? (
        <p className="no-data-msg">No data available.</p>
      ) : (
        <>
          <div className="chart-wrapper" style={{ flex: 1, minHeight: 0, padding: '5px', marginBottom: '5px', background: 'transparent', boxShadow: 'none' }}>
            <Bar
              data={chartConfig}
              options={{
                responsive: true,
                maintainAspectRatio: false,

                // 2. Logic triggered when hovering over the Chart
                onHover: (event, elements) => {
                  if (elements.length > 0) {
                    const { datasetIndex, index } = elements[0];
                    // Store the subject index and the score range dataset index into the State
                    setHoveredData({ subjectIndex: index, datasetIndex: datasetIndex });
                  } else {
                    // Clear the State when the mouse is moved away
                    setHoveredData(null);
                  }
                },

                scales: {
                  x: { stacked: true, ticks: { font: { size: 11 } } },
                  y: { stacked: true, title: { display: true, text: 'Number of Students', font: { size: 11 } } }
                },
                plugins: {
                  legend: { position: 'top', reverse: true, labels: { boxWidth: 12, font: { size: 11 } } },
                  tooltip: {
                    // Smooth transition animation for the Tooltip
                    animation: { duration: 200 }
                  }
                }
              }}
            />
          </div>

          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#e0e0e0', padding: '4px', border: '1px solid #ccc', width: '80px' }}>Marks</th>
                  {validSubjects.map(sub => (
                    <th key={sub} style={{ backgroundColor: '#f8f9fa', padding: '4px', border: '1px solid #ccc', fontWeight: 'bold' }}>{sub}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scoreRanges.map(range => (
                  <tr key={range.label}>
                    <td style={{ backgroundColor: range.bg, color: range.color, fontWeight: 'bold', padding: '2px', border: '1px solid #ccc' }}>
                      {range.label}
                    </td>

                    {validSubjects.map((sub, subjectIndex) => {
                      // 3. Check if this specific cell is currently being hovered
                      const isHovered = hoveredData &&
                        hoveredData.subjectIndex === subjectIndex &&
                        hoveredData.datasetIndex === range.index;

                      return (
                        <td
                          key={sub}
                          style={{
                            padding: '2px',
                            border: '1px solid #ccc',
                            // Apply background color if hovered
                            backgroundColor: isHovered ? range.bg : 'transparent',
                            // Apply correct text color (white/black) if hovered
                            color: isHovered ? range.color : 'inherit',
                            fontWeight: isHovered ? 'bold' : 'normal',
                            transition: 'all 0.2s ease-in-out' // Smooth color transition
                          }}
                        >
                          {data[sub][range.index]}
                        </td>
                      );
                    })}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default GraphDashboard;