const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();

router.get("/", (req, res) => {
  const query = `SELECT "users".id, "users".username,
 "concerts".venue, "concerts".date, ARRAY_AGG("bands".name
  ORDER BY "bands".concert_position ASC) FROM "users" 
  JOIN "user_concerts" ON "user_concerts".id = "users".id
   JOIN "concerts" ON "concerts".id = "user_concerts".id JOIN 
"bands" ON "bands".concert_id = "concerts".id GROUP BY "users".id,
"users".username, "concerts".venue, "concerts".date;
`;
pool.query(query).then((result) => {
    res.send(result.rows);
}).catch((err) => {
    console.log("error getting all concerts for every movie,", err);
    res.sendStatus(500);
});
})
module.exports = router;
