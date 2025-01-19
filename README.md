# E-shop-project (Docker-Keycloak)
This rep contains the project for the 'Services in Cloud and Fog Computing' course at TUC.

**This is the containerised version of the e-shop with Keycloak.**
- Make sure you have docker installed.
- Download the rep, extract the content and inside the directory run docker compose up --build
- The eshop should be up and running on http://localhost:3000

**Regarding Keycloak**
In this version there are 2 premade users:
- seller1  (username: seller1, password: seller1)
- customer1 (username: customer1, password: customer1)
- You can access the keycloak admin page at http://localhost:8080 with credentials: user=admin, password=adminpassword)

Each user has his corresponding role and every new user that registers is
a customer by default. You need to login as admin and manually update the roles.

**Regarding Kafka**
Kafka was not implemented

**Final Grade**
*7.5/10*
