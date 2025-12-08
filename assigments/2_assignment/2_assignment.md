# 💛 VolunMe – Turning Free Time into Meaningful Action

## HCI Assignment – User Personas & Information Architecture

---

## 1. User Personas

### 👩 **Ana – Student Volunteer**
  ![Ana – Student Volunteer](https://github.com/bornazuzul/HCI-Project/blob/main/assigments/2_assignment/images/1_user.jpeg)
- **Age:** 20  
- **Occupation:** Psychology student  
- **Location:** Split  
- **Goals:**  
  - Help the community and gain experience for her CV  
  - Meet new people and build a sense of belonging  
- **Motivation:** Loves helping others but struggles to find volunteering events easily  
- **Frustrations:** Scattered and disorganized information about volunteering opportunities  
- **Quote:** “I want to help, but I don’t know where to start.”  


---

### 👨 **Marko – Event Organizer**
![Marko – Event Organizer](https://github.com/bornazuzul/HCI-Project/blob/main/assigments/2_assignment/images/2_user.jpeg)
- **Age:** 35  
- **Occupation:** Local NGO event coordinator  
- **Location:** Zagreb  
- **Goals:**  
  - Find volunteers for events  
  - Easily manage events 
- **Motivation:** Wants a simple way to connect with volunteers  
- **Frustrations:** Wastes time posting events across multiple platforms  
- **Quote:** “I wish there was one place where all volunteers could see our events.”  
 
  

---

### 👩‍🏫 **Ivana – Working Professional**
  ![Ivana – Working Professional](https://github.com/bornazuzul/HCI-Project/blob/main/assigments/2_assignment/images/3_user.jpeg)
- **Age:** 42  
- **Occupation:** Teacher  
- **Location:** Zadar  
- **Goals:**  
  - Discover short-term volunteer activities that fit her busy schedule  
  - Contribute to society in her free time  
- **Motivation:** Feels fulfilled when helping others  
- **Frustrations:** Hard to find flexible, time-friendly volunteering options  
- **Quote:** “I’d love to help, but I need something that fits my time.”  
 


---

### 👵 **Marija – Active Retiree**  
![Marija – Active Retiree](https://github.com/bornazuzul/HCI-Project/blob/main/assignments/2_assignment/images/older_user.jpeg)
- **Age:** 61  
- **Occupation:** Retired Nurse  
- **Location:** Split  
- **Goals:**  
  - Find volunteering opportunities that allow her to stay social and feel useful  
  - Share her knowledge and experience with others  
- **Motivation:** Wants to stay active and connected with the community after retirement  
- **Frustrations:** Many volunteering activities are not tailored for older adults or require too much physical effort  
- **Quote:** “I may be retired, but I still have a lot to give.”  

--- 

### 👴 **Ivan – Community-Oriented Retiree**  
![Ivan – Community-Oriented Retiree](https://github.com/bornazuzul/HCI-Project/blob/main/assignments/2_assignment/images/older_user2.jpeg)
- **Age:** 63  
- **Occupation:** Retired Electrician  
- **Location:** Osijek  
- **Goals:**  
  - Use his free time to help with practical, hands-on community projects  
  - Mentor younger volunteers in technical or repair-related activities  
- **Motivation:** Feels proud when he can apply his lifelong skills to help others  
- **Frustrations:** Most volunteer opportunities are focused on youth or digital tasks rather than manual or community-based work  
- **Quote:** “I’ve spent my life fixing things — now I’d like to fix what’s broken in my community.”  

---


## 2. Information Architecture

### **App Entry (Login / Registration)**
- **Login:**  
  - If the user already has an account, they log in.  
  - A session token is created and the user is redirected to the **Home** page.  
- **Registration:**  
  - If the user doesn’t have an account, they click the “No account?” button.  
  - The app redirects them to the registration form where they fill in:  
    - First name  
    - Last name  
    - Email  
    - Password  
  - After successful registration, they are redirected back to **Login**.  

---

### **USER**

#### **Home**
- Introduction, images, and app description.  
- “About” section explaining the app’s purpose and goals.  

#### **Activities**
- Displays all available activities.  
- Filtering options:
  - By location  
  - By type of activity  
- Users can:
  - Join or withdraw from activities  
  - Create new activities (pending admin approval)  
- Each activity shows the number of registered participants.  

#### **Notifications**
- All users can view all notifications.  
- The user who created an event can send a notification related to that event.  
- To create a notification:
  - Click the “Create” button → opens popup  
  - Select an event from the list of user’s events  
  - Enter title and message  

---

### **ADMIN**

#### **Home**
- Same content as user’s home.  

#### **Activities**
- Admin can delete events (automatically sends a notification to all users that the event has been removed).  
- Admin can view a list of newly created activities and approve them for public visibility.  

#### **Notifications**
- Admin can delete notifications.  

#### **Users**
- Admin can view all users.  
- Admin can delete users.  

---

## 3. Sitemap
![sitemap](https://github.com/bornazuzul/HCI-Project/blob/main/assigments/2_assignment/images/sitemap.png)


