import { MongoClient, Db, ObjectId, FindOptions, IndexSpecification } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import * as MongoDb from "../mongodb_client";

const DB_NAME = "test_db_1";
const COLLECTION_NAME = "Col2";

describe("MongoDb basic queries.", () => {
  let client: MongoClient;

  const getCollection = () => {
    const db: Db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    return collection;
  };

  beforeAll(async () => {
    client = await MongoDb.getClient();
  });

  afterAll(async () => {
    await client?.close();
  });

  it("Should insert a large set of documents.", async () => {
    const collection = getCollection();

    const docCount = 1000;
    const docs = [];

    for (let i = 0; i < docCount; ++i) {
      const now = new Date();
      now.setDate(now.getDate() - i);
      const id = uuidv4();
      // This is just a practice to set the _id manually.
      const _id: string = id.replace(/-/g, "");
      const hexString = Buffer.from(_id, "hex").toString("hex").slice(0, 24);

      const doc = {
        _id: new ObjectId(hexString),
        id: id,
        timestamp: now.toISOString(),
        seq: i,
        fullName: faker.person.fullName(),
        address: faker.location.streetAddress(),
        content: `${faker.commerce.productDescription()}. ${faker.word.words(20)}.`,
        hasFlag: i % 3 == 0,
      };

      docs.push(doc);
    }

    const response = await collection.insertMany(docs);

    expect(response).toBeTruthy();
    expect(response.acknowledged).toEqual(true);
    expect(response.insertedCount).toEqual(docCount);
  });

  it("Should return all documents with complex filters.", async () => {
    const collection = getCollection();
    const query = {
      hasFlag: true,
      fullName: {
        $ne: "John Smith",
      },
      seq: {
        $lt: 50,
      },
      address: {
        $in: ["989 East Road"],
      },
    };
    const options: FindOptions = {
      skip: 0,
      limit: 10,
    };

    const documents = await collection.find(query, options).toArray();

    expect(documents).toBeTruthy();
    expect(documents.length).toBeTruthy();
  });

  it("Should index 'content' field as a text for full-text search.", async () => {
    const collection = getCollection();
    const config: IndexSpecification = {
      content: "text",
    };

    const response = await collection.createIndex(config);

    expect(response).toBeTruthy();
  });

  it("Should return all documents with full test search filters.", async () => {
    const collection = getCollection();
    const query = {
      $text: {
        $search: "Magazine",
      },
    };
    const options: FindOptions = {
      skip: 0,
      limit: 10,
    };

    const documents = await collection.find(query, options).toArray();

    expect(documents).toBeTruthy();
    expect(documents.length).toBeTruthy();
  });
});
