import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import db from "./_db.js";

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    reviews: () => db.reviews,
    review: function getReviewById(_, args) {
      return db.reviews.find((review) => review.id == args.id);
    },
    games: () => db.games,
    game: function getGameById(_, args) {
      return db.games.find((game) => game.id == args.id);
    },
    authors: () => db.authors,
    author: function getAuthorById(_, args) {
      return db.authors.find((author) => author.id == args.id);
    },
  },
  Game: {
    reviews: function getGameReviews(parent) {
      return db.reviews.filter((review) => review.game_id == parent.id);
    },
  },
  Author: {
    reviews: function getAuthorReviews(parent) {
      return db.reviews.filter((review) => review.author_id == parent.id);
    },
  },
  Review: {
    author: function findAuthor(parent) {
      return db.authors.find((author) => author.id == parent.author_id);
    },
    game: function findGame(parent) {
      return db.games.find((game) => game.id == parent.game_id);
    },
  },
  Mutation: {
    deleteGame(_, args) {
      return (db.games = db.games.filter((game) => game.id != args.id));
    },
    addGame(_, args) {
      let game = {
        id: db.games.length + 1,
        ...args.game,
      };
      db.games.push(game);
      return game;
    },
    updateGame(_, args) {
      db.games = db.games.map((game) => {
        if (game.id == args.id) {
          return {
            ...game,
            ...args.updateFields,
          };
        }
        return game;
      });

      return db.games.find((game) => game.id == args.id);
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
