const http = require('http');

const cookie = `token=${process.argv[2]}`;
if (!process.argv[2]) { console.error('Provide token as arg'); process.exit(1); }

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/me',
  method: 'GET',
  headers: {
    'Cookie': cookie,
  },
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
req.end();
