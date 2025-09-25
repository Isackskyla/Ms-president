const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore("viewCounts"); // Creates a store named "viewCounts" if it doesn't exist
  const imageId = event.queryStringParameters.imageId || (event.body ? JSON.parse(event.body).imageId : null);

  if (!imageId) {
    return { statusCode: 400, body: "Missing imageId" };
  }

  let count = await store.get(imageId);
  count = count ? parseInt(count, 10) : 0;

  if (event.httpMethod === "POST") {
    count += 1;
    await store.set(imageId, count.toString());
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ count }),
  };
};