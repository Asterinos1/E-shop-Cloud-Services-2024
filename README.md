# E-shop-project (Docker-Keycloak)
This rep contains the project for the 'Services in Cloud and Fog Computing' course at TUC.

**This is the containerised version of the e-shop with Keycloak.**
- Make sure you have docker installed.
- Download the rep on your pc, extract the content and inside the directory run docker compose up --build
- The eshop should be up and running on http://localhost:3000
- (Make sure the port 5432 is not already in use by some other instance perhaps postgres)

**Regarding Keycloak**
In this version there are 2 premade users:
- seller1  (username: seller1, password: seller1)
- customer1 (username: customer1, password: customer1)

Each user has his corresponding role and every new user that registers is
a customer by default. You need to login as admin (admin, adminpassword) 
and manually update the roles (localhost:8080/admin). 
