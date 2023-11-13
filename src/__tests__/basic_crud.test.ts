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
  let client;

  const getCollection = () => {
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    return collection;
  };

  beforeAll(async () => {
    client = await MongoDb.getClient();
  });

  afterAll(async () => {
    await client?.close();
  });

  it("Should create or update a document.", async () => {
    const collection = getCollection();
    const query = { id: DOC_ID }; // Specify the criteria to find the document
    const update = {
      $set: DOC_PAYLOAD,
    };
    const config = {
      returnNewDocument: true,
      upsert: true,
    };

    const response = await collection.updateOne(query, update, config);

    expect(response).toBeTruthy();
    expect(response.acknowledged).toBe(true)
  });
});
