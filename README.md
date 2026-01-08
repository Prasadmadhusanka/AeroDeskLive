# AeroDesk LIVE: Real-Time Airport & Flight Tracker Dashboard Using React.js, OpenLayers, and Aviation Edge API

## ✈️ Link of AeroDesk LIVE
**<a href="https://prasadmadhusanka.github.io/AeroDeskLive/" target="_blank">Visit AeroDesk LIVE</a>**


## Repository Overview

This repository hosts the complete real-time airport and flight tracking dashboard, AeroDesk LIVE, built with React.js and OpenLayers. It integrates live flight arrivals, departures, and schedules from airports worldwide using the Aviation Edge API, along with live weather data from the OpenWeather API.

## Technologies Used

![React.js](https://img.shields.io/badge/React.js-61DAFB?style=for-the-badge&logo=react&logoColor=20232A) 
![JavaScript ES6+](https://img.shields.io/badge/JavaScript%20(ES6%2B)-F7DF1E?style=for-the-badge&logo=javascript&logoColor=323330) 
![OpenLayers](https://img.shields.io/badge/OpenLayers-1F6FEB?style=for-the-badge&logo=openlayers&logoColor=white) 
![REST API](https://img.shields.io/badge/REST_API-FF6F00?style=for-the-badge&logo=fastapi&logoColor=white) 
![Aviation Edge API](https://img.shields.io/badge/Aviation_Edge_API-2E86C1?style=for-the-badge&logoColor=white) 
![OpenWeather API](https://img.shields.io/badge/OpenWeather_API-FC4C02?style=for-the-badge&logo=openweathermap&logoColor=white) 
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white) 
![tz-lookup](https://img.shields.io/badge/tz--lookup-009688?style=for-the-badge&logo=npm&logoColor=white) 
![Luxon](https://img.shields.io/badge/Luxon-4A90E2?style=for-the-badge&logo=npm&logoColor=white) 
![React Bootstrap](https://img.shields.io/badge/React_Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white) 
![React Select](https://img.shields.io/badge/React--Select-00BFFF?style=for-the-badge&logo=react&logoColor=white) 
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) 
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) 
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-181717?style=for-the-badge&logo=github&logoColor=white)


## Introduction

In today’s fast-paced aviation environment, real-time tracking and visualization of flight and airport data are essential for operational insights and decision-making. AeroDesk LIVE is designed as an end-to-end real-time flight tracking dashboard, leveraging API integration, interactive mapping, and dynamic data visualization. Live flight and airport data from the Aviation Edge API and weather information from the OpenWeather API are continuously ingested, processed, and displayed on interactive dashboards built with React.js and OpenLayers.

The system provides searchable airport data, dynamic charts, and accurate local time calculations using tz-lookup and Luxon, enabling comprehensive visualization of air traffic and flight patterns worldwide. Users can monitor arrivals, departures, and route durations in real time, explore nearby airports, and view weather conditions at different airport locations. The dashboard also supports interactive map layers, zooming, and panning for a detailed spatial understanding of air traffic flows.

## Objectives

- **Build a real-time flight tracking dashboard** that integrates live arrivals, departures, and schedules from the Aviation Edge API.  
- **Visualize airport and flight data interactively** using React.js and OpenLayers, including searchable airports, dynamic charts, and airline routes using map vector layers.  
- **Incorporate live weather insights** from the OpenWeather API to provide weather information for airports.  
- **Ensure accurate local time calculations** for flights using tz-lookup and Luxon, including shortest and longest route analysis.

## Data Sources

### 1. Aviation Edge API
[Aviation Edge API](https://aviation-edge.com/) provides comprehensive, real-time flight schedule data, including arrivals, departures, and flight routes for airports globally, along with nearest airport information based on GPS coordinates. By using a secure API key, the project accesses multiple endpoints to extract daily flight details such as flight numbers, departure and arrival times, aircraft types, and airline information. This data is continuously ingested to ensure the dashboard displays up-to-date flight operations worldwide, enabling real-time tracking and analysis.

### 2. OurAirports
[OurAirports](https://ourairports.com/) offers detailed geographic, operational, and reference data about airports across the globe, including IATA and ICAO codes, runway specifications, elevation, and location coordinates. For this project, the CSV file containing airport data was downloaded and integrated into the system to enrich flight information with accurate spatial context. This allows the dashboard to plot airports on interactive maps, link flights to their respective airports, and support features such as search, nearby airports visualization, and airport-specific weather insights.

### 3. OpenWeather API
[OpenWeather API](https://openweathermap.org/) provides real-time and forecasted weather data for locations worldwide, including temperature, wind speed, visibility, and weather conditions. For this project, it is used to enrich airport and flight information with current weather insights, helping users understand the environmental context affecting flight operations. The API is accessed via a secure key, allowing the dashboard to display live weather data alongside flight schedules, departures, and arrivals, and to provide a more comprehensive view of air traffic conditions.

## Methodology

## Usage of AeroDesk LIVE Airport Tracker Dashboard

## Thank You!

Thank you for taking the time to explore this project.

Happy coding! 🚀