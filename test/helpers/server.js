const {promisify} = require('util');
const micro = require('micro');
const Timeout = require('await-timeout');

const defaultHandler = async req => {
  const {session, version} = req.body;
  const response = {
    text: 'привет',
    tts: 'привет'
  };
  return {response, session, version};
};

let handler = defaultHandler;
let delay = 0;

const server = micro(async (req, res) => {
  if (req.method === 'POST') {
    req.body = await micro.json(req);
    server.requests.push(req.body);
  }
  if (delay) {
    await Timeout.set(delay);
  }
  return handler(req, res);
});

server.listen = promisify(server.listen);
server.close = promisify(server.close);
server.requests = [];
server.getUrl = () => `http://localhost:${server.address().port}`;
server.setHandler = newHandler => handler = newHandler;
server.setEchoHandler = () => server.setHandler(req => {
  return {
    method: req.method,
    url: req.url,
  };
});
server.setResponseBody = responseBody => server.setHandler(() => responseBody);
server.setResponse = response => server.setHandler(req => {
  const {session, version} = req.body;
  return {response, session, version};
});
server.setDelay = ms => delay = ms;
server.reset = () => {
  server.requests.length = 0;
  delay = 0;
  handler = defaultHandler;
};

module.exports = server;
