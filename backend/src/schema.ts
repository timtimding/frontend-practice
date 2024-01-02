const schemaDefs = `#graphql
  type Color {
    color: String
    colorCode: [Int!]!
  }
  type Query {
    colors: [Color!]
  }

  input CreateColorInput {
    color: String!
    colorCode: [Int!]!
  }
  input UpdateColorInput {
    color: String!
    colorCode: [Int!]!
  }
  input DeleteColorInput {
    color: String!
  }
  type Mutation {
    createColor(input: CreateColorInput!): Boolean!
    updateColor(input: UpdateColorInput!): Boolean!
    deleteColor(input: DeleteColorInput!): Boolean!
  }

  enum ColorMutationType {
    CREATED
    UPDATED
    DELETED
  }
  type ColorMutationSubscription {
    color: String!
    colorCode: [Int!]!
    mutation: ColorMutationType!
  }
  type Subscription {
    colorMutated: ColorMutationSubscription
  }
`;

export default schemaDefs;

