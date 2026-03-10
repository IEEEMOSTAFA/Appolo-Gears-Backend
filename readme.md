Erd link: https://github.com/BayajidAlam/apollo-gears-backend/blob/main/docs/PRD.md

full link: https://github.com/BayajidAlam/apollo-gears-backend





### 🔗 সম্পূর্ণ Flow একনজরে
```
User(user)
   └── Rent তৈরি করে (car select করে)
            └── Bid আসে Driver থেকে
                    └── User একটা Bid accept করে
                              └── RentStatus → ongoing
                                      └── Trip শেষ → completed




 সহজ কথায় — User গাড়ি ভাড়া চায়, Driver দাম বলে, User accept করে trip শুরু হয়! 🚗💨     
 
  => Update migration: apollo-cli prisma migrate
                                 