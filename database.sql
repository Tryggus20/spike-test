-- create database concert_masterlist
--USERS TABLE
CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(30) not null,
is_admin BOOLEAN default false,
password VARCHAR(30) not null
);

INSERT INTO users ("username", "is_admin", "password")
VALUES ('david', TRUE, 1234), ('scott', FALSE, 1234);

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
concert_id INTEGER REFERENCES concerts(id) ON DELETE CASCADE,
name VARCHAR(60) NOT NULL,
concert_position INTEGER NOT NULL
);

--USER_CONCERTS Joiner table
CREATE TABLE user_concerts (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
concert_id INTEGER REFERENCES concerts(id) ON DELETE CASCADE,
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
user_concert_id INTEGER REFERENCES user_concerts(id) ON DELETE CASCADE,
type VARCHAR(30) NOT NULL,
description VARCHAR(1000)
-- description is updated. was too small.
);

-- FRIENDS 
CREATE TABLE friends (
id SERIAL PRIMARY KEY,
user_1 INTEGER REFERENCES users(id) ON DELETE CASCADE,
user_2 INTEGER REFERENCES users(id) ON DELETE CASCADE,
follow BOOLEAN default false,
met_where VARCHAR(60)
);


select * FROM "users";

drop table bands;
drop table concerts;
drop table users;
drop table user_concerts;
drop table enhancements;
drop table friends;



SELECT "users".id, "users".username, "concerts".venue, "concerts".date, ARRAY_AGG("bands".name ORDER BY "bands".concert_position ASC) FROM "users" JOIN "user_concerts" ON "user_concerts".user_id = "users".id JOIN "concerts" ON "concerts".id = "user_concerts".concert_id JOIN "bands" ON "bands".concert_id = "concerts".id GROUP BY "users".id, "users".username, "concerts".venue, "concerts".date;


SELECT "users".id AS user_id, "users".username, "concerts".venue, "concerts".date, ARRAY_AGG("bands".name ORDER BY "bands".concert_position ASC) FROM "users" JOIN "user_concerts" ON "user_concerts".user_id= "users".id JOIN "concerts" ON "concerts".id = "user_concerts".concert_id JOIN "bands" ON "bands".concert_id = "concerts".id WHERE "user_id"=2 GROUP BY "users".id, "users".username, "concerts".venue, "concerts".date;

