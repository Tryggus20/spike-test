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
    // Checks to see if a concert already exists. If so, get the concert_id
    // If it does not exist, it adds a new concert!
    const checkConcertQuery = `
    SELECT id FROM concerts 
    WHERE venue = $1 AND city = $2 AND state = $3 AND date = $4;
  `;

    const concertValues = [venue, city, state, date];
    const concertResult = await pool.query(checkConcertQuery, concertValues);

    let concertId;
    if (concertResult.rows.length > 0) {
      // If concert exists, get its ID
      concertId = concertResult.rows[0].id;
    } else {
      // Insert the new concert and retrieve its ID
      const insertConcertQuery = `
      INSERT INTO concerts (venue, city, state, date)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
      const insertResult = await pool.query(insertConcertQuery, concertValues);
      concertId = insertResult.rows[0].id;
    }

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
VALUES ($1, $2, $3)
RETURNING id;`;
    const commentValues = [userId, concertId, comments];
    const user_concertsResults = await pool.query(
      addCommentQuery,
      commentValues
    );
    const user_concert_id = user_concertsResults.rows[0].id;
    // 4) adding into enhancements for pic url
    const addEnhancementQuery = `INSERT INTO "enhancements" (user_concert_id, type, description)
VALUES ($1, $2, $3 );`;
    const { type, description } = req.body;
    const enhancementValues = [user_concert_id, type, description];

    await pool.query(addEnhancementQuery, enhancementValues);
    res.status(201).json({ message: `Concert and bands have been added` });
  } catch (err) {
    console.log(`err in adding concert and bands`, err);
    res
      .status(500)
      .json({ error: `An error occurred adding concert and bands` });
  }
});

module.exports = router;
