
# Final Report
## VolunMe – Turning Free Time into Meaningful Action

**Students:** Mirko Radan and Borna Žužul  
**Course:** Human–Computer Interaction  
**Date:** [1.2.2026]  
**Live App:** https://hci-project-rho.vercel.app/  
**GitHub Repository:** https://github.com/bornazuzul/HCI-Project  

---

## 1. Project Idea

The main idea behind **VolunMe** is to create a web application that connects people who want to volunteer with organizations and community events that need help.
Many individuals spend their free time unproductively, often scrolling social media or playing games, while at the same time communities lack volunteers for meaningful activities. VolunMe aims to bridge this gap by offering a centralized, simple, and motivating platform where volunteering opportunities are easily accessible.
The goal of the application is to transform free time into positive social impact and encourage users to contribute to their communities.

---

## 2. The Problem

Currently, there is no single, well-organized platform where people can easily discover volunteering opportunities. Information is scattered across social media, websites, and local announcements.

This creates two major issues:

- Volunteers struggle to find suitable activities.
- Organizations struggle to reach potential helpers.

As a result, both sides lose valuable opportunities for cooperation and community growth.

---

## 3. Target Users

### Primary Users
- Students
- Working professionals
- Retirees
- Community‑minded individuals who want to help society

### Secondary Users
- NGOs
- Local organizations
- Event organizers needing volunteers

### Community‑Oriented Users
- Individuals seeking social connection, teamwork, and belonging through volunteering.

---

## 4. Proposed Solution

**VolunMe** is a user‑friendly web application that allows:

- Discovering volunteering events
- Filtering activities by location and type
- Joining or withdrawing from events
- Creating new activities
- Managing notifications
- Admin moderation and approvals

### Key Features

- **Event Discovery** – Browse and filter volunteering activities  
- **Activity Management** – Join, withdraw, or create events  
- **Admin Panel** – Approval and moderation of activities  
- **Notifications System** – Event‑related communication  
- **Community Engagement** – Encouraging teamwork and social impact  

---

## 5. User Personas

### Ana – Student Volunteer
(https://github.com/bornazuzul/HCI-Project/blob/main/assigments/2_assignment/images/1_user.jpeg)
- **Age:** 20  
- **Occupation:** Psychology Student  
- **Location:** Split  
- **Goals:** Gain experience, help community, meet people  
- **Motivation:** Loves helping others  
- **Frustration:** Disorganized volunteering information  
- **Quote:** *“I want to help, but I don’t know where to start.”*

### Marko – Event Organizer
(https://github.com/bornazuzul/HCI-Project/blob/main/assigments/2_assignment/images/2_user.jpeg)
- **Age:** 35  
- **Occupation:** NGO Coordinator  
- **Location:** Zagreb  
- **Goals:** Find volunteers, manage events efficiently  
- **Motivation:** Wants centralized platform  
- **Frustration:** Posting events on multiple platforms  
- **Quote:** *“I wish there was one place where all volunteers could see our events.”*

### Ivana – Working Professional
(https://github.com/bornazuzul/HCI-Project/blob/main/assigments/2_assignment/images/3_user.jpeg)
- **Age:** 42  
- **Occupation:** Teacher  
- **Location:** Zadar  
- **Goals:** Short‑term volunteering opportunities  
- **Motivation:** Personal fulfillment  
- **Frustration:** Lack of flexible options  
- **Quote:** *“I’d love to help, but I need something that fits my time.”*

---

## 6. Information Architecture

### App Entry
- **Login** – Existing users authenticate and enter Home.
- **Registration** – New users fill personal data and are redirected to Login.

### USER ROLE

#### Home
- App introduction and purpose.
- About section.

#### Activities
- List of all volunteering events.
- Filtering by:
  - Location
  - Activity type
- Join / Withdraw options.
- Create activity (admin approval required).
- Participant count visibility.

#### Notifications
- All users view notifications.
- Event creators can send notifications through a popup form.

### ADMIN ROLE

#### Home
- Same as user home.

#### Activities
- Approve new activities.
- Delete events (auto notification sent).

#### Notifications
- Delete notifications.

#### Users
- View all users.
- Delete users.

---

## 7. Sitemap

The sitemap defines hierarchical navigation between:

- Login / Register
- Home
- Activities
- Notifications
- Users (Admin)
- Activity Details
- Create Activity Popup

The structure ensures clarity and fast access to core features.

---

## 8. Design and User Interface

The interface follows **minimalistic and modern design principles**:

- Clear navigation
- Simple color palette
- Readable typography
- Responsive layout
- Emphasis on accessibility and clarity

The goal was to avoid clutter and allow users to focus on actions rather than visual noise.

---

## 9. HCI Principles Applied

### Usability
Simple flows for joining and creating activities.

### Consistency
Same layout patterns across pages.

### Learnability
New users quickly understand navigation.

### Feedback
Notifications confirm user actions.

### Error Prevention
Admin approval prevents spam or invalid events.

---

## 10. Evaluation and Improvements

Potential future improvements:

- User ratings for events
- Advanced search filters
- Gamification (badges for volunteers)

---

## 11. Technologies Used

*(Fill in your real technologies if needed)*

Example:

- React / Next.js
- TypeScript
- Tailwind CSS
- Vercel Hosting
- Supabase

---

## 12. Performance Testing

Performance testing was conducted using Google PageSpeed Insights.

### Mobile Result
![Mobile Speed Test](https://github.com/bornazuzul/HCI-Project/blob/main/assigments/images/mobile%20speed.jpg)



### Desktop Result
![Desktop Speed Test](https://github.com/bornazuzul/HCI-Project/blob/main/assigments/images/desktop%20speedtest.jpg)



## 13. Conclusion

VolunMe successfully demonstrates how HCI principles can be applied to create a meaningful and socially impactful digital product.

The application encourages volunteering, strengthens communities, and offers an intuitive, centralized solution for connecting people who want to help with those who need support.

Future iterations can further improve accessibility, personalization, and user engagement, but even in its current form VolunMe fulfills its core mission — **turning free time into meaningful action.**

