const messages = [
  "Hello World!",
  "Hello Serverless!",
  "It's a great day today!",
  "Yay, I'm learning something new today!",
  "On cloud nine!",
  "Over the moon!",
  "Shooting for the stars!",
  "On top of the World!",
  "World at my feet!",
  "Doing everything I love!"
];

exports.handler = async (event, context) => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  const response = {
    statusCode: 200,
    // devolvemos JSON { "message": "..." }
    body: JSON.stringify({ message })
  };
  return response;
};