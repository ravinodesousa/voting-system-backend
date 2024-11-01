Step 1] Clone project using following link

git clone https://github.com/ravinodesousa/voting-system-backend.git

Step 2] Move to the root of the project

cd voting-system-backend

Step 3] install node packages

npm install

Step 4] Create MySQL database manually and change the details in DB config file found at follwoign path

ROOT_DIRECTORY/config/config.json

change following values for "development", "test" and "production"
"username": "YOUR SQL USERNAME",
"password": "YOUR SQL PASSWORD",
"database": "YOUR SQL DB NAME",

for testing kepp all values the same

Step 4] Run project

npm start
