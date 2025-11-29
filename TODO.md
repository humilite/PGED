# Test Plan: Basic Users Page Functionality

## ✅ Completed Fixes
- [x] Database migration from PostgreSQL to SQLite
- [x] Backend server running on port 5000
- [x] Frontend development server running on port 5173
- [x] Database initialized with admin user

## 🔄 Current Testing Phase: Basic Functionality

### Test 1: Admin Login
- [ ] Open browser to http://localhost:5173
- [ ] Navigate to login page
- [ ] Login with admin credentials: admin@dgrh.gov.ga / admin123
- [ ] Verify successful login and redirect to dashboard

### Test 2: Navigation to Users Page
- [ ] From dashboard, navigate to Admin section
- [ ] Click on "Utilisateurs" or users management link
- [ ] Verify URL changes to /admin/users
- [ ] Check that UserList component renders

### Test 3: Users Data Loading
- [ ] Verify users table displays
- [ ] Check that at least admin user appears in list
- [ ] Verify table columns: Utilisateur, Email, Rôle, Département, Statut, Dernière connexion, Actions
- [ ] Check for any error messages

### Test 4: Basic UI Elements
- [ ] Verify "Nouvel Utilisateur" button is present
- [ ] Check search bar functionality
- [ ] Verify pagination controls if multiple pages
- [ ] Check responsive design on different screen sizes

## 📋 Next Phase: Full CRUD Testing (After Basic Tests Pass)
- [ ] Create new user functionality
- [ ] Edit existing user functionality
- [ ] Delete user functionality
- [ ] Search and filter functionality
- [ ] Error handling and validation
- [ ] Token refresh and authentication
