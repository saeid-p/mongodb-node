// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/introduction.html
import { MongoClient } from "mongodb";
import { readEnvironmentVariable } from "./config";

const host = readEnvironmentVariable("MONGODB_HOST") || "127.0.0.1";
const port = readEnvironmentVariable("MONGODB_PORT") || "27017";
const username = readEnvironmentVariable("MONGODB_USERNAME");
const password = readEnvironmentVariable("MONGODB_PASSWORD");

const uriSegments = ["mongodb://"];
if (username && password) {
  uriSegments.push(`${username}:`);
  const passwordEncoded = encodeURIComponent(password);
  uriSegments.push(`${passwordEncoded}@`);
}
uriSegments.push(`${host}:${port}`);
const connectionUrl = uriSegments.join("");

const getClient = async () => {
  const client = new MongoClient(connectionUrl);
  await client.connect();
  return client;
};

export { getClient };
