## Sprint 2 Project Status 

### 1. Authentication & Registration - Fully implemented
- **Admin Login**: Backend logic for admin authentication includes secure password verification, session handling, and access control to ensure only authorized admins access the portal.
- **Player Registration**: Developed the player registration form with frontend validation and backend logic to securely store player profiles in the database, allowing players to create accounts to access the platform.
- **User Authentication**: Players can log in securely, enabling access to their trading profiles and allowing notifications for trades and platform updates.

### 2. User and Admin Dashboards  - Partially implemented
- **User Dashboard UI**: A welcoming, user-friendly landing page that serves as the primary portal for players, displaying trading options, available balance, and trading progress.
- **Admin Dashboard UI**: Designed for administrators to monitor real-time game activity, manage user profiles, track stock availability, and manage stock prices.

### 3. Stock Data Integration  - Fully implemented
- **Stocks API Integration**: Integrated external stock APIs to fetch live stock data for the simulation, ensuring data integrity and realistic market representation.

### 4. Database Setup - Partially implemented
- **Database Creation**: Created a robust database structure to store user profiles, game data, transactions, and stock details. The database is designed for scalability, efficient data retrieval, and to support complex data relationships.

### 5. Architecture Documentation - Completed
- **Web Framework Architecture**: Developed and documented the web framework architecture, including component diagrams. This document provides a technical overview, showing how different components of the application interact.

### 6. Project Management & Sprint Documentation - Completed
- **SCRUM Meeting Minutes**: Properly documented SCRUM meetings with a standing agenda covering progress, decisions, and planning. Minutes were regularly committed, allowing team members easy access.
- **Kanban Board & Issue Tracker**: Consistently maintained Kanban board and issue tracker to manage task assignments, track progress, and address issues identified during reviews.
- **Design and Process Documentation**: Updated process documentation, detailing actual processes followed, team performance reviews, PR approval processes, and final sprint report for a transparent overview of the project's status.

### 7. Unit Testing - Not completed
- Thoroughly develop unit tests for business logic and carry them over to the next sprint for completion.
This was not completed due to constraint. In the future business logic PR deadline will be set earlier
---

## Planned Features and Tasks (Sprint 3)

### 1. Enhanced Gaming and Stock Simulation
- **Real-Time Trading Enhancements**: Implement improvements based on issues from Sprint 2, enhancing both backend and frontend responsiveness for real-time trading functionality.
- **Market Events Simulation**: Introduce in-game events that simulate market trends, providing players with dynamic scenarios to influence trading decisions.

### 2. Advanced User Experience Features
- **Watchlist Feature**: Allow players to add specific stocks to a watchlist for quick access and monitoring.
- **Automated Trading**: Introduce automation for scheduled buys/sells based on stock thresholds, adding strategic depth and player convenience.

### 3. Admin Features Expansion
- **NYSE Price Scheduling**: Allow admins to configure live or simulated NYSE price updates, enhancing game realism and control over the market environment.
- **Analytics Dashboard**: Provide admins with an analytical overview of player behavior, stock trends, and system health metrics to support data-driven decision-making.


---

## Technologies Used
- **Backend**: Node.js for server logic and backend functionality, with secure authentication processes.
- **Frontend**: CSS for styling and responsive design across devices.
- **Database**: Structured database setup to handle user data, stock information, and transaction records.
- **Real-Time Data**: Integrated external stock APIs to fetch and display real-time market data for a realistic trading experience.

---

In the upcoming sprint, we aim to enhance both user and admin functionalities within the gaming and stock simulation environment. This includes addressing areas of improvement identified during Sprint 2 to ensure a more seamless and engaging experience. Additionally, we plan to systematically incorporate feedback received from Sprints 1 and 2, refining our features and workflows in preparation for the final product release. These enhancements will focus on improving usability, resolving any outstanding issues, and optimizing performance to deliver a polished, competitive, and reliable platform for users and administrators alike.
