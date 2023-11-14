import { MongoClient, Db, FindOptions } from "mongodb";
import * as MongoDb from "../mongodb_client";

const DB_NAME = "test_db_1";
const COLLECTION_NAME = "Col1";
const DOC_ID = "7839e7a9-ea50-465b-a346-beddd48be2c8";
const DOC_PAYLOAD = {
  id: DOC_ID,
  fullName: "Kim Scott",
  text: "MongoDb: cool. bonsai cool text to analyze and search.",
  timestamp: new Date().toISOString(),
};

describe("MongoDb CRUD basic commands.", () => {
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

  it("Should create a document.", async () => {
    const collection = getCollection();

    const response = await collection.insertOne(DOC_PAYLOAD);

    expect(response).toBeTruthy();
    expect(response.acknowledged).toBe(true);
  });

  it("Should create or update a document.", async () => {
    const collection = getCollection();
    const query = { id: DOC_ID };
    const update = {
      $set: DOC_PAYLOAD,
    };
    const config = {
      returnNewDocument: true,
      upsert: true,
    };

    const response = await collection.updateOne(query, update, config);

    expect(response).toBeTruthy();
    expect(response.acknowledged).toBe(true);
  });

  it("Should return collection document count.", async () => {
    const collection = getCollection();

    const response = await collection.countDocuments();

    expect(response).toBeTruthy();
  });

  it("Should return all documents in a collection.", async () => {
    const collection = getCollection();
    const query = {};

    const documents = await collection.find(query).toArray();

    expect(documents).toBeTruthy();
    expect(documents.length).toBeTruthy();
  });

  it("Should return all documents in a collection with projection.", async () => {
    const collection = getCollection();
    const query = {};
    const options = {
      projection: {
        _id: false, // You can only mix inclusion and exclusion for _id field.
        fullName: true,
      },
    };

    const documents = await collection.find(query, options).toArray();

    expect(documents).toBeTruthy();
    expect(documents.length).toBeTruthy();
    documents.forEach((document) => {
      expect(document.fullName).toBeTruthy();
      expect(document.text).toBeFalsy();
    });
  });

  it("Should return all documents paginated and sorted.", async () => {
    const collection = getCollection();
    const query = {};
    const options: FindOptions = {
      skip: 20,
      limit: 10,
      sort: {
        fullName: 1, // 1 for asc.
        timestamp: -1, // -1 for desc
      },
    };

    const documents = await collection.find(query, options).toArray();

    expect(documents).toBeTruthy();
    expect(documents.length).toEqual(0);
  });

  it("Should get a document by id.", async () => {
    const collection = getCollection();
    const query = { id: DOC_ID };

    const response = await collection.findOne(query);

    expect(response).toBeTruthy();
    expect(response.id).toEqual(DOC_ID);
  });

  it("Should get a document by a property.", async () => {
    const collection = getCollection();
    const query = { fullName: DOC_PAYLOAD.fullName };

    const response = await collection.findOne(query);

    expect(response).toBeTruthy();
    expect(response.id).toEqual(DOC_ID);
  });

  it("Should remove a document by id.", async () => {
    const collection = getCollection();
    const query = { id: DOC_ID };

    const response = await collection.deleteOne(query);

    expect(response).toBeTruthy();
    expect(response.acknowledged).toBe(true);
    expect(response.deletedCount).toBeTruthy();
  });
});
