'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- SRI LANKA CITY COORDINATES LOOKUP ---
const CITY_COORDS = {
  "colombo": [6.9271, 79.8612],
  "kandy": [7.2906, 80.6337],
  "galle": [6.0535, 80.2210],
  "jaffna": [9.6615, 80.0255],
  "negombo": [7.2081, 79.8373],
  "anuradhapura": [8.3114, 80.4037],
  "trincomalee": [8.5874, 81.2152],
  "batticaloa": [7.7310, 81.6747],
  "matara": [5.9549, 80.5550],
  "kurunegala": [7.4863, 80.3647],
  "ratnapura": [6.6939, 80.3982],
  "badulla": [6.9934, 81.0550],
  "gampaha": [7.0840, 79.9947],
  "nuwara eliya": [6.9497, 80.7891],
  "dambulla": [7.8731, 80.7718],
  "hambantota": [6.1429, 81.1212],
  "kalutara": [6.5854, 79.9607],
  "matale": [7.4675, 80.6234],
  "puttalam": [8.0206, 79.8258],
  "polonnaruwa": [7.9403, 81.0188]
};

// --- CUSTOM PIN ICON ---
// Using a DivIcon with SVG prevents "image not found" errors in Next.js
const createCustomIcon = (count) => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="
        background-color: #9333ea;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
          font-family: sans-serif;
        ">${count}</div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42], // Tip of the pin
    popupAnchor: [0, -45]
  });
};

export default function JobHeatmap({ jobs }) {
  const [groupedJobs, setGroupedJobs] = useState({});

  // Group jobs by city so they stack in one popup
  useEffect(() => {
    const groups = {};
    
    jobs.forEach(job => {
      const city = job.workLocation?.toLowerCase().trim();
      if (CITY_COORDS[city]) {
        if (!groups[city]) groups[city] = [];
        groups[city].push(job);
      }
    });

    setGroupedJobs(groups);
  }, [jobs]);

  return (
    <MapContainer 
      center={[7.8731, 80.7718]} 
      zoom={8} 
      style={{ height: "100%", width: "100%", borderRadius: "1rem", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {Object.entries(groupedJobs).map(([city, cityJobs]) => {
        const coords = CITY_COORDS[city];
        
        return (
          <Marker 
            key={city} 
            position={coords} 
            icon={createCustomIcon(cityJobs.length)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-lg capitalize mb-2 border-b pb-1">
                  {city} <span className="text-purple-600 text-sm">({cityJobs.length} Jobs)</span>
                </h3>
                <ul className="max-h-40 overflow-y-auto space-y-2">
                  {cityJobs.map(job => (
                    <li key={job._id} className="text-sm bg-gray-50 p-2 rounded hover:bg-purple-50 transition">
                      <div className="font-semibold text-gray-800">{job.jobTitle}</div>
                      <div className="text-xs text-gray-500">{job.companyName}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 pt-2 border-t text-xs text-center text-gray-400">
                  Zoom in to see more
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}