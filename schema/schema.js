const graphql = require("graphql");
const axios = require("axios");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    user: {
      type: new GraphQLList(UserType),
      resolve: (parentValue, args) => {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(res => res.data);
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLInt },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    gender: { type: GraphQLString },
    age: { type: GraphQLInt },
    picture: { type: GraphQLString },
    email: { type: GraphQLString },
    address: { type: GraphQLString },
    company: {
      type: CompanyType,
      resolve: ({ companyId }, args) => {
        return axios
          .get(`http://localhost:3000/companies/${companyId}`)
          .then(res => res.data);
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve: (parentValue, { id }) => {
        return axios
          .get(`http://localhost:3000/users/${id}`)
          .then(resp => resp.data);
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLInt } },
      resolve: (parentValue, { id }) => {
        return axios
          .get(`http://localhost:3000/companies/${id}`)
          .then(resp => resp.data);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        gender: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        picture: { type: GraphQLString },
        email: { type: new GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLString },
        companyId: { type: GraphQLInt }
      },
      resolve: (parentValue, { firstName, lastName, age, gender, email }) => {
        return axios
          .post(`http://localhost:3000/users`, {
            firstName,
            lastName,
            age,
            gender,
            email
          })
          .then(res => res.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parentValue, { id }) => {
        return axios.delete(`http://localhost:3000/users/${id}`);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        gender: { type: GraphQLString },
        age: { type: GraphQLInt },
        email: { type: GraphQLString },
        address: { type: GraphQLString }
      },
      resolve: (parentValue, args) => {
        return axios
          .patch(`http://localhost:3000/users/${args.id}`, args)
          .then(res => res.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
