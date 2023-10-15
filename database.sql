-- create database concert_masterlist
-- MAY NEED TO CHANGE SOME STUFF TO INCLUDE FOREIGN KEY!!!
--USERS TABLE
CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(30) not null,
is_admin BOOLEAN default false,
password VARCHAR(30) not null
);


-- thoughts on venue/city/state not null?
--CONCERTS TABLE
CREATE TABLE concerts (
id SERIAL PRIMARY KEY,
venue VARCHAR(60),
city VARCHAR(30),
state VARCHAR(2),
date DATE NOT NULL
);

--BANDS TABLE
CREATE TABLE bands (
id SERIAL PRIMARY KEY,
concert_id INTEGER REFERENCES concerts,
name VARCHAR(60) NOT NULL,
concert_position INTEGER NOT NULL
);

--USER_CONCERTS Joiner table
CREATE TABLE user_concerts (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users,
concert_id INTEGER REFERENCES concerts,
hidden BOOLEAN default false,
is_deleted BOOLEAN default false,
deleted_date DATE,
favorite BOOLEAN default false,
comments VARCHAR(280),
seat_location VARCHAR(30)
);

--ENHANCEMENTS
CREATE TABLE enhancements (
id SERIAL PRIMARY KEY,
user_concert_id INTEGER REFERENCES user_concerts,
type VARCHAR(30) NOT NULL,
description VARCHAR(100)
);

-- FRIENDS 
CREATE TABLE friends (
id SERIAL PRIMARY KEY,
user_1 INTEGER REFERENCES users,
user_2 INTEGER REFERENCES users,
follow BOOLEAN default false,
met_where VARCHAR(60)
);


select * FROM "users";


--for every user
SELECT "users".id, "users".username, "concerts".venue, "concerts".date, ARRAY_AGG("bands".name ORDER BY "bands".concert_position ASC) FROM "users" JOIN "user_concerts" ON "user_concerts".id = "users".id JOIN "concerts" ON "concerts".id = "user_concerts".id JOIN "bands" ON "bands".concert_id = "concerts".id GROUP BY "users".id, "users".username, "concerts".venue, "concerts".date;

--for specific user
SELECT "users".id AS user_id, "users".username, "concerts".venue, "concerts".date, ARRAY_AGG("bands".name ORDER BY "bands".concert_position ASC) FROM "users" JOIN "user_concerts" ON "user_concerts".user_id= "users".id JOIN "concerts" ON "concerts".id = "user_concerts".concert_id JOIN "bands" ON "bands".concert_id = "concerts".id WHERE "user_id"=1 GROUP BY "users".id, "users".username, "concerts".venue, "concerts".date;
