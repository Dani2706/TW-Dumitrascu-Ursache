## ✨ Features

### 🔐 User Authentication
- User registration and login
- Secure access to personal listings

### 🏠 Property Page
- View detailed listings with:
  - 📸 Images
  - 📝 Descriptions
  - 🏷️ Tags  
- ⚠️ *Upcoming*: map with a location pin for property positioning

### 🌟 Featured Properties Section
Displayed on the homepage, this section shows **5 curated listings**:
- 🏢 1 apartment for sale  
- 🏘️ 1 apartment for rent  
- 🏡 1 house  
- 🌾 1 land plot  
- 🏬 1 commercial space  

#### ✅ Selection Criteria:
- Posted between **7 and 30 days ago**
- From users who **haven’t had a featured listing** in the past year
- Listings with at least **5% favorite rate** *(favorites / views)*
- Chosen based on the **highest number of views** within those constraints

🔄 Updated **weekly** using a **PL/SQL stored procedure** triggered by an **Oracle DBMS scheduler job**

### 🛠️ Listings Management Panel
- Add new property listings
- Edit active listings
- Delete own listings
