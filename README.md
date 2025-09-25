# RISEUP – Backend for Finance Management Application
Overview

This repository contains the backend of the RISEUP finance management application, built using Node.js, Express.js, and MongoDB. It provides APIs for income, expense, and savings tracking, integrates with the Gemini API for financial data, and includes AI-driven investment suggestions.

Features

RESTful APIs for managing user income, expenses, and savings goals

Expense alerts when spending exceeds predefined thresholds

AI investment suggestions based on user savings

Gemini API integration for real-time financial data

Tech Stack

Backend: Node.js, Express.js

Database: MongoDB

API Integration: Gemini API

AI Logic: Predictive investment suggestions


Installation

Clone the repository

Navigate to the project folder

Install dependencies:
npm install

Create a .env file and add:

MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_api_key


Start the server:
npm start

Usage

Access APIs via /api/* endpoints to manage user finances

AI investment suggestions are computed automatically from user savings data

Author

Sanpreeth Ranjith
Email: sanpreethranjith2004@gmail.com
 


