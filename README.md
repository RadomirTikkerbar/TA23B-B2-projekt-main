Software Requirements Specification (SRS) Document
Cinema Web Application
1. Introduction
1.1 Purpose
The purpose of this document is to specify the requirements for the development of a cinema web application that allows users to view movie sessions, browse showtimes, and purchase tickets online.
1.2 Scope
This document outlines the functional and non-functional requirements for the Cinema Web Application. The system will provide features for users to search for movies, view available sessions, select seats, and complete ticket purchases.
2. General Description
2.1 Product Perspective
The Cinema Web Application will operate as a standalone system, interacting with internal/external databases for movie details, session schedules, and payment processing systems. It will provide a user-friendly interface for cinema customers and an administrative interface for cinema staff to manage sessions and ticketing.
2.2 Product Features
●	User Management: User registration and login, user profile management.
●	Movie Listings: Display of movies currently showing and upcoming releases.
●	Session Management: Interface that allows the user to make changes in their current session.
●	Seat Selection: A broad selection of seats that be chosen however the user desires.
●	Ticket Purchase: An option to purchase tickets for certain movies, price and availability of which will vary depending on the session, theater, etc.
●	…
2.3 User Classes and Characteristics
●	Customers: Individuals who browse movies, check session times, and purchase tickets.
●	Cinema Staff (Admin): Users who manage movie listings, session schedules, and seat availability.
●	…
2.4 Operating Environment
The web application will run on modern web browsers (e.g., Chrome, Firefox, Safari) and mobile devices. 
Website's certificate will automatically update if it were to expire.
2.5 Design and Implementation Constraints
The application will use a relational database for managing movie data and user bookings. 
The application will feature authentication and login tools via commonly used tools such as SmartID, registration via ID card, etc.
3. Functional Requirements
3.1 Movie Listings
The system will display current and upcoming movies, including the following details:
●	Movie title, poster, and description
●	Rating and duration
●	Available languages and subtitles
●	Session times for each cinema location
3.2 Session Management
● Basic options are provided to end or start a session.
3.3 User's session automatically expires after 15 minutes of inactivity to avoid unneccesary latency.
3.4 Every action that requires a change of user's credintals will always follow with a 2FA authentication.
4. Non-Functional Requirements
4.1 Performance
● The site will not use any elements that otherwise cause performance issues or hinderances in properly loading the site.
4.2 Security
● User's account and every change will require a 2FA authentication to confirm user's identity. Site's database will not be accessible and site's structure will always backed up in a private GitHub repository.
4.3 Usability
● Website will feature options to personalize user's experience. (For instance, colour inversion, option to switch between dark and light mode respectively, etc.)
4.4 Reliability
●	User can safely add their payment creditals that will be assessed by their local bank that will manage their payment requests with no risk of data loss.
4.5 Scalability
●	[Fill in…]
4.6 Legal and Compliance
●	The application must comply with GDPR for user data protection.
● Website must be approved by the Estonian and Digital Law before it will be distributed or uploaded to the web.
6. System Models
5.1 Use Case Diagram
A use case diagram will illustrate the interactions between customers, admin staff, and the system, such as browsing movies, selecting seats, and purchasing tickets.
5.2 Sequence Diagrams
Sequence diagrams will show the flow of actions for purchasing a ticket and managing session data.
5.3 Data Flow Diagrams
Data flow diagrams will depict the flow of information within the system, such as how movie session data is displayed to users and how bookings are processed.
7. External Interface Requirements
6.1 User Interfaces
●	A user-friendly interface for customers to browse movies, view sessions, and buy tickets.
●	An admin interface for cinema staff to manage movies and sessions.
6.2 Hardware Interfaces
●	Depending on the hardware user has, site may adapt and become simpler(?) in a way that avoids technical hinderances.
6.3 Software Interfaces
●	Depending on the software user currently utilizes, site may adapt in a way that avoids technical hinderances.
6.4 Communication Interfaces
● Website's data will be stored on Cloudflare.
8. Testing and Validation
7.1 Test Case
●	
7.2 Validation Criteria
●	
9. Maintenance and Support
8.1 Maintenance Procedures
● Internal code and database is to be automatically backed up and changed upon the release of new content or features, as well as to restore the site in the event of cyberattack.
8.2 Support and Helpdesk
● User can contact support if they will have any issues related with the website and their session.
10. Appendices
9.1 Glossary
●	SRS: Software Requirements Specification
●	GDPR: General Data Protection Regulation
●	
9.2 Revision History
●	Document revisions will be logged with dates and descriptions of changes.
