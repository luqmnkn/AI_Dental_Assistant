const http = require('http');

const data = JSON.stringify({ email: 'test3@example.com', password: 'Password123!', name: 'Test User' });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
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
    try {
      const hdr = res.headers['set-cookie'] && res.headers['set-cookie'][0];
      if (hdr) {
        const m = hdr.match(/token=([^;]+)/);
        if (m) console.log('TOKEN:', m[1]);
      }
    } catch (e) {}
  });
});

req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
req.write(data);
req.end();
