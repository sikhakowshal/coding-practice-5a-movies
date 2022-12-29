const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error : ${err.message}`);
    program.exit(1);
  }
};
initializeDbAndServer();

//API TO GET ALL MOVIES FROM MOVIE TABLE
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name
        FROM movie;
    `;

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API TO INSERT A MOVIE INTO MOVIE TABLE
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createBookQuery = `
        INSERT INTO movie(director_id, movie_name, lead_actor)
        VALUES (
            ${directorId},
           '${movieName}',
           '${leadActor}'
        );
    `;
  const dbResponse = db.run(createBookQuery);
  const movieId = await dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API TO GET A MOVIE BASED ON MOVIE_ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT 
            *
        FROM
            movie
        WHERE
            movie_id = ${movieId};
    `;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };
  const movieObject = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieObject));
});

//API TO UPDATE A MOVIE IN MOVIE TABLE
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE
      movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API TO DELETE A MOVIE BASED ON MOVIE_ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM movie
        WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API TO GET DIRECTORS FROM DIRECTORS TABLE
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT *
        FROM director;
    `;

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };

  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((director) => convertDbObjectToResponseObject(director))
  );
});

//API TO GET MOVIES OF A SPECIFIC DIRECTOR
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
        SELECT movie_name
        FROM movie
        WHERE director_id=${directorId};
    `;

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };

  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
