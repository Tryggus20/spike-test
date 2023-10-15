const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();

//gt request for all users
router.get("/", (req, res) => {
  const query = `SELECT "users".id, "users".username,
 "concerts".venue, "concerts".date, ARRAY_AGG("bands".name
  ORDER BY "bands".concert_position ASC) FROM "users" 
  JOIN "user_concerts" ON "user_concerts".id = "users".id
   JOIN "concerts" ON "concerts".id = "user_concerts".id JOIN 
"bands" ON "bands".concert_id = "concerts".id GROUP BY "users".id,
"users".username, "concerts".venue, "concerts".date;
`; // ARRAY_AGG does change bands into an array of strings!
pool.query(query).then((result) => {
    res.send(result.rows);
}).catch((err) => {
    console.log("error getting all concerts for everyone,", err);
    res.sendStatus(500);
});
})// end of GET request for ALL CONCERTS

//get request for single user!
router.get("/:id", (req, res) => {
    const id = req.params.id;
    const query = `SELECT "users".id AS user_id,
     "users".username, "concerts".venue, "concerts".date,
      ARRAY_AGG("bands".name ORDER BY "bands".concert_position ASC)
       FROM "users" JOIN "user_concerts" ON "user_concerts".id 
       = "users".id JOIN "concerts" ON "concerts".id = 
       "user_concerts".id JOIN "bands" ON "bands".concert_id = 
       "concerts".id WHERE "user_id"=$1 GROUP BY "users".id, 
       "users".username, "concerts".venue, "concerts".date;`;
       //// ARRAY_AGG does change bands into an array of strings!
  pool.query(query, [id]).then((result) => {
      res.send(result.rows);
  }).catch((err) => {
      console.log("error getting all concerts for single user,", err);
      res.sendStatus(500);
  });
  })// end of GET request for a SPECIFIC USER'S CONCERTS
  

  router.post("/:id", (req, res) => {
const id= req.params.id;

  })



module.exports = router;


