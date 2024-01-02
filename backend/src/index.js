"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ws_1 = require("ws");
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const graphql_subscriptions_1 = require("graphql-subscriptions");
require("reflect-metadata");
const schema_1 = require("@graphql-tools/schema");
const schemaDefs = `#graphql
  type Color {
    color: String
    colorCode: [Int!]!
  }
  type Query {
    colors: Color
  }
  type AddColorMutationResponse {
    color: String!
    colorCode: [Int!]!
  }
  input AddColorMutationInput {
    color: String!
    colorCode: [Int!]!
  }
  type Mutation {
    addColor(colorInput: AddColorMutationInput): AddColorMutationResponse
    deleteColor(colorCode: [Int!]!): Boolean
    changeColorCode(colorCode: [Int!]!): Boolean
  }
`;
let colors = [
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
const resolvers = {
    Query: {
        colors: () => {
            return colors;
        }
    },
    Mutation: {
        addColor: (_, { colorInput }) => {
            colors.push(colorInput);
            return colorInput;
        },
        deleteColor: (_, { colorCode }) => {
            colors = colors.filter(color => color.colorCode !== colorCode);
            return true;
        },
        changeColorCode: (_, { colorCode }) => {
            colors = colors.map(color => {
                if (color.colorCode === colorCode) {
                    color.colorCode = [0, 0, 0];
                }
                return color;
            });
            return true;
        }
    }
};
const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: schemaDefs, resolvers });
const port = process.env.PORT || 4000;
(async function () {
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.json({ limit: "20mb" }));
    app.use(body_parser_1.default.urlencoded({ limit: "20mb", extended: true }));
    app.use((0, cookie_parser_1.default)());
    const httpServer = http_1.default.createServer(app);
    // const schema = makeExecutableSchema({ typeDefs, resolvers })
    const pubsub = new graphql_subscriptions_1.PubSub();
    // Creating the WebSocket subscription server
    const wsServer = new ws_1.WebSocketServer({
        // This is the `httpServer` returned by createServer(app);
        server: httpServer,
        // Pass a different path here if your ApolloServer serves at
        // a different path.
        path: "/graphql",
    });
    const server = new apollo_server_express_1.ApolloServer({
        schema,
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            // Bruh
                        },
                    };
                },
            },
            ...(process.env.NODE_ENV === "production"
                ? [(0, apollo_server_core_1.ApolloServerPluginLandingPageDisabled)()]
                : []),
        ],
        cache: "bounded",
    });
    await server.start();
    server.applyMiddleware({ app });
    await new Promise((resolve) => {
        httpServer.listen({ port }, resolve);
        console.log(`🚀 Server Ready at ${port}! 🚀`);
        console.log(`Graphql Port at ${port}${server.graphqlPath}`);
    });
})();
