import express from "express";

import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";

import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginDrainHttpServer,
} from "apollo-server-core";

import { PubSub } from "graphql-subscriptions";
import "reflect-metadata";

import { makeExecutableSchema } from "@graphql-tools/schema";

import schemaDefs from "./schema";

import {
  Color,
  CreateColorVariables,
  ColorMutationType,
} from "./types";

import { useServer } from "graphql-ws/lib/use/ws";


let colors: Color[] = [
  {
    color: "red",
    colorCode: [255, 0, 0]
  },
  {
    color: "green",
    colorCode: [0, 255, 0]
  },
  {
    color: "blue",
    colorCode: [0, 0, 255]
  }
];

(async function() {

  const app = express();
  app.use(bodyParser.json({ limit: "20mb" }));
  app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
  app.use(cookieParser());

  const port = process.env.PORT || 4000;

  const httpServer = http.createServer(app);
  // const schema = makeExecutableSchema({ typeDefs, resolvers })
  const pubsub = new PubSub();
  // Creating the WebSocket subscription server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` returned by createServer(app);
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql",
  });

  const resolvers = {
    Query: {
      colors: async () => {
        return colors
      }
    },
    Mutation: {
      createColor: async (_: any, variables: CreateColorVariables): Promise<boolean> => {
        const { color, colorCode } = variables.input;
        const newColor: Color = {
          color,
          colorCode
        };

        if (colors.find((c) => c.color === color)) {
          return false;
        }
        colors.push(newColor);

        pubsub.publish("COLOR_MUTATED", {
          colorMutated: {
            ...newColor,
            mutation: ColorMutationType.CREATED,
          },
        });

        return true;
      },
      updateColor: async (_: any, variables: CreateColorVariables): Promise<boolean> => {
        const { color, colorCode } = variables.input;
        const newColor: Color = {
          color,
          colorCode
        };

        const index = colors.findIndex((c) => c.color === color);
        if (index === -1) {
          return false;
        }
        colors[index] = newColor;

        pubsub.publish("COLOR_MUTATED", {
          colorMutated: {
            ...newColor,
            mutation: ColorMutationType.UPDATED,
          },
        });

        return true;
      },
      deleteColor: async (_: any, variables: CreateColorVariables): Promise<boolean> => {
        const { color } = variables.input;

        const index = colors.findIndex((c) => c.color === color);
        if (index === -1) {
          return false;
        }

        pubsub.publish("COLOR_MUTATED", {
          colorMutated: {
            color: colors[index].color, 
            colorCode: colors[index].colorCode,
            mutation: ColorMutationType.DELETED,
          },
        });

        colors.splice(index, 1);

        return true;
      }
    },
    Subscription: {
      colorMutated: {
        subscribe: () => pubsub.asyncIterator(["COLOR_MUTATED"]),
      },
    },
  };

  const schema = makeExecutableSchema({ typeDefs: schemaDefs, resolvers });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ...(process.env.NODE_ENV === "production"
        ? [ApolloServerPluginLandingPageDisabled()]
        : []),
    ],
    cache: "bounded",
  });

  await server.start();
  server.applyMiddleware({ app });
  await new Promise<void>((resolve) => {
    httpServer.listen({ port }, resolve);
    console.log(`🚀 Server Ready at ${port}! 🚀`);
    console.log(`Graphql Port at ${port}${server.graphqlPath}`);
  });
})();

