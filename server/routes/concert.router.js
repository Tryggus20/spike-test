const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();

//get request for all users
router.get("/", (req, res) => {
  const query = `SELECT "users".id, "users".username,
 "concerts".venue, "concerts".date, ARRAY_AGG("bands".name
  ORDER BY "bands".concert_position ASC) FROM "users" 
  JOIN "user_concerts" ON "user_concerts".id = "users".id
   JOIN "concerts" ON "concerts".id = "user_concerts".id JOIN 
"bands" ON "bands".concert_id = "concerts".id GROUP BY "users".id,
"users".username, "concerts".venue, "concerts".date;
`; // ARRAY_AGG does change bands into an array of strings!
  pool
    .query(query)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log("error getting all concerts for everyone,", err);
      res.sendStatus(500);
    });
}); // end of GET request for ALL CONCERTS

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
  pool
    .query(query, [id])
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log("error getting all concerts for single user,", err);
      res.sendStatus(500);
    });
}); // end of GET request for a SPECIFIC USER'S CONCERTS

// ------------------------------------------------------------//
// *** ADD CONCERT HERE ***
router.post("/add-concert/:id", async (req, res) => {
  const userId = req.params.id;
  // 1) adding into "concerts" first
  try {
    const { venue, city, state, date, bands, comments } = req.body;
    const addConcertQuery = `INSERT INTO "concerts" (venue, city, state, date)
VALUES ($1, $2, $3, $4)
RETURNING id;`;
    const concertInfo = [venue, city, state, date];
    const concertResult = await pool.query(addConcertQuery, concertInfo);
    const concertId = concertResult.rows[0].id;

    // 2) second adding into "bands"
    for (const band of bands) {
      const { name, concertPosition } = band;
      const addBandQuery = `INSERT INTO "bands" (concert_id, name, concert_position)
    VALUES ($1, $2, $3);`;

      const bandInfo = [concertId, name, concertPosition];
      await pool.query(addBandQuery, bandInfo);
    } // end of loop
    // 3) now 3rd step is to add into user_concerts
    const addCommentQuery = `INSERT INTO "user_concerts" (user_id, concert_id, comments)
VALUES ($1, $2, $3);`;
    const commentValues = [userId, concertId, comments];
    await pool.query(addCommentQuery, commentValues);
    res.status(201).json({ message: `Concert and bands have been added` });
  } catch (err) {
    console.log(`err in adding concert and bands`, err);
    res
      .status(500)
      .json({ error: `An error occurred adding concert and bands` });
  }
});

module.exports = router;
