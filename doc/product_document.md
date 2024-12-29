# Product Documentation

## Overview
This document provides a detailed overview of the product, its features, and usage instructions. The application is a stock trading simulation platform that allows users to buy, sell, and trade stocks. Additionally, administrators can monitor user activity, configure game settings, and view leaderboards.

## Features

### 1. Authentication & Registration - Fully Implemented
- **Admin Login**: 
  - **Credentials**:
    - **Email**: `teamj-admin@mun.ca`
    - **Password**: `123456`
  - The admin can log in to access the dashboard and manage the application. Backend logic ensures secure authentication and session handling.
- **Player Registration**: 
  - Developed the player registration form with frontend validation and backend logic to securely store player profiles in the database, allowing players to create accounts and access the platform.
- **User Authentication**: 
  - Players can log in securely, enabling access to their trading profiles and receiving notifications for trades and platform updates.

### 2. User and Admin Dashboards - Fully Implemented
- **User Dashboard UI**: 
  - A welcoming, user-friendly landing page that serves as the primary portal for players. It displays trading options, available balance, and trading progress.
- **Admin Dashboard UI**: 
  - Designed for administrators to monitor real-time game activity. The admin can manage user profiles, track stock availability, and adjust stock prices. The dashboard includes graphical views for enhanced monitoring.

### 3. Stock Data Integration - Fully Implemented
- **Stocks API Integration**: 
  - Integrated external stock APIs to fetch live stock data for the simulation. This ensures data integrity and provides realistic market representation for users.
- **Stock Price Update Based on Historical Data**: 
  - Implemented functionality to update stock prices based on historical data. This allows for a dynamic market simulation where stock prices are adjusted according to past trends, enhancing the realism and gameplay experience.

### 4. Database Setup - Fully Implemented
- **Database Creation**: 
  - Created a robust database structure to store essential data such as user profiles, game data, transactions, and stock details. The database is designed for scalability and efficient data retrieval.

### 5. Architecture Documentation - Completed
- **Web Framework Architecture**: 
  - Developed and documented the web framework architecture, including component diagrams. This technical overview shows how different components interact within the application.

### 6. Project Management & Sprint Documentation - Completed
- **SCRUM Meeting Minutes**: 
  - Documented SCRUM meetings with a standing agenda, capturing progress, decisions, and planning. The minutes are committed regularly for easy access by team members.
- **Kanban Board & Issue Tracker**: 
  - Consistently maintained the Kanban board and issue tracker to manage task assignments, track progress, and address issues identified during reviews.
- **Design and Process Documentation**: 
  - Updated documentation detailing the processes followed by the team, including performance reviews, PR approval processes, and the final sprint report, providing a transparent overview of the project's status.

## 7. Product Features Documentation - Completed
- The **Stock Trading Simulation Platform** is built to replicate a real-world trading environment where users can engage in simulated stock trading, make informed decisions, and track their portfolios in real-time. Key points include:
 - **Real-time Stock Trading**: Players can buy, sell, and trade stocks based on live data sourced from external APIs.
- **Dynamic Stock Price Updates**: Stock prices are adjusted dynamically based on historical data, replicating real-world market fluctuations.
- **Admin Control Panel**: Administrators have full access to user profiles, game activity, and can configure game settings like stock prices.
- **Graphical Portfolio Tracking**: Users can view their portfolio’s performance in an interactive and visually engaging way.
- **Leaderboard**: Tracks and displays top performers, promoting healthy competition among players.
- **User Authentication & Registration**: Secure login and registration process ensures only authorized users can participate in the game.
- **Speed Mode**: Allows users to simulate market behavior at an accelerated pace using historical data for fast-paced trading sessions.

### 8. Graphical Display of Portfolio Performance - Completed
- **Graphical Performance Tracking**: 
  - Provides users with a visually engaging and interactive way to track their portfolio's performance throughout the simulation. The feature helps users monitor their trading progress.

### 9. Speed Mode Setting for Accelerated Simulation - Completed
- **Accelerated Simulation**: 
  - A speed mode feature allows users to simulate market behavior at an accelerated pace using historical stock data. This feature enhances the gameplay experience by speeding up market actions.

### 10. Unit Testing - Completed
- **Unit Testing**: 
  - Developed unit tests for business logic to ensure that the platform functions as expected. These tests were executed to verify the success of each feature and ensure no functionality is broken.

## Planned Features and Backlogs from User Stories

### User Story 1: Improve Real-Time Page Updates
- **As a** player,  
- **I want** the page to update in real-time without requiring a manual refresh,  
- **So that** I can have a seamless experience while tracking stock price changes and game updates.

#### Acceptance Criteria:
- The stock prices and leaderboard should update automatically without refreshing the page.
- Players joining or leaving the game should reflect on the UI in real-time.
- The system should handle updates efficiently without causing performance issues.
- Notifications or indicators should display in case of update errors.

---

### User Story 2: Support Multiple Game Sessions
- **As an** admin,  
- **I want** to manage multiple game sessions simultaneously,  
- **So that** players can choose their preferred session without waiting for ongoing games to finish.

#### Acceptance Criteria:
- Admin should be able to create, edit, and delete multiple game sessions.
- Players should have a clear interface to join specific game sessions.
- Each session should maintain its own independent stock market and leaderboard.
- Notifications should prevent players from accidentally joining multiple sessions at once.

---

### User Story 3: Session Notifications
- **As a** player,  
- **I want** to receive notifications about my game session,  
- **So that** I am aware of important updates (e.g., session start, countdown, results).

#### Acceptance Criteria:
- The user receives notifications when the game session is about to start or end.
- The user is notified when they receive a trade alert (e.g., stock price reaches target).
- In-app and/or email notifications are sent based on the user’s preferences.

---

### User Story 4: Achievements & Badges
- **As a** user,  
- **I want** to earn achievements and badges for milestones,  
- **So that** I can track my progress and be recognized for my trading skills.

#### Acceptance Criteria:
- The user receives achievements for completing certain milestones (e.g., first trade, highest single trade, top portfolio gain).
- Achievements are displayed on the user profile.
- Badges can be shared on social media or within the app.

---

## User Story 5: Risk Management Insights
As a player,  
I want to see a risk analysis of my investments,  
So that I can make informed decisions and minimize losses.

### Acceptance Criteria:
- Users receive insights into the risk level of their current portfolio.
- Suggestions are provided for diversification or risk reduction.
- Visual indicators (e.g., charts, ratings) help users understand risk levels.

---

## User Story 6: Daily Challenges
As a player,  
I want to participate in daily trading challenges,  
So that I can test my skills and earn rewards.

### Acceptance Criteria:
- Challenges are updated daily and focus on specific trading goals (e.g., highest gain in a single day).
- Rewards are given upon successful completion (e.g., in-app currency, badges).
- A separate leaderboard tracks challenge participants.

---


## Technologies Used
- **Backend**: Node.js for server logic and backend functionality, with secure authentication processes.
- **Frontend**: CSS for styling and responsive design across devices.
- **Database**: Structured database setup to handle user data, stock information, and transaction records.
- **Real-Time Data**: Integrated external stock APIs to fetch and display real-time market data for a realistic trading experience.
- **Framework**: Express.js to utilize for efficient request handling, routing, and middleware management in the backend..

---

