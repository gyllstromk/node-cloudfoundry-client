var nock = require('nock');
  

nock('https://ourhost.com:443')
  .post('/users/me@me.com/tokens', {"password":"mypassword"})
  .reply(200, "{\"token\":\"bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEzNzcxMDg0NzEsInVzZXJfbmFtZSI6Im1lQG1lLmNvbSIsInNjb3BlIjpbImNsb3VkX2NvbnRyb2xsZXIucmVhZCIsImNsb3VkX2NvbnRyb2xsZXIud3JpdGUiLCJvcGVuaWQiLCJwYXNzd29yZC53cml0ZSJdLCJlbWFpbCI6Im1lQG1lLmNvbSIsImF1ZCI6WyJvcGVuaWQiLCJjbG91ZF9jb250cm9sbGVyIiwicGFzc3dvcmQiXSwianRpIjoiYWM5ZjkyYTQtYjFkNS00YTZlLTk3ZDItYjRkNDVhMGYyMzM2IiwidXNlcl9pZCI6Ijg1OTY4YzA2LWZjMGEtNGNkOS04NmJiLWZjM2RjNjRkZTkwZCIsImNsaWVudF9pZCI6InZtYyJ9.vvDkp2_41HhgQobm-oD_uSy0NZhY0JYAoAJJg7bDTiA\"}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:34 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"ef04b674cebf16133664322b19b74405"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .delete('/apps/testapp')
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:34 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .post('/apps', {"name":"testapp","staging":{"model":"node","stack":"node0815"},"uris":["testapp.ourhost.com"],"resources":{"memory":64},"instances":1})
  .reply(302, "{\"result\":\"success\",\"redirect\":\"http://ourhost.com/apps/testapp\"}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:35 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  location: 'http://ourhost.com/apps/testapp',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .post('/apps/testapp/application')
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:40 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/testapp')
  .reply(200, "{\"name\":\"testapp\",\"staging\":{\"model\":\"node\",\"stack\":\"node0815\"},\"uris\":[\"testapp.ourhost.com\"],\"instances\":1,\"runningInstances\":0,\"resources\":{\"memory\":64,\"disk\":2048,\"fds\":256},\"state\":\"STOPPED\",\"services\":[],\"version\":\"950134e85319919774108e3f4c1e0d8c601e7ccf-0\",\"env\":[],\"meta\":{\"debug\":null,\"console\":null,\"version\":1,\"created\":1376518240}}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:40 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"b5727f493b44e4f73acb5b21c9cb5e0f"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/testapp')
  .reply(200, "{\"name\":\"testapp\",\"staging\":{\"model\":\"node\",\"stack\":\"node0815\"},\"uris\":[\"testapp.ourhost.com\"],\"instances\":1,\"runningInstances\":0,\"resources\":{\"memory\":64,\"disk\":2048,\"fds\":256},\"state\":\"STOPPED\",\"services\":[],\"version\":\"950134e85319919774108e3f4c1e0d8c601e7ccf-0\",\"env\":[],\"meta\":{\"debug\":null,\"console\":null,\"version\":1,\"created\":1376518241}}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:41 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"d878d99892f52bc47882c342db9bbb50"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .put('/apps/testapp', {"name":"testapp","staging":{"model":"node","stack":"node0815"},"uris":["testapp.ourhost.com"],"instances":1,"runningInstances":0,"resources":{"memory":64,"disk":2048,"fds":256},"state":"STARTED","services":[],"version":"950134e85319919774108e3f4c1e0d8c601e7ccf-0","env":[],"meta":{"debug":null,"console":null,"version":1,"created":1376518241}})
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:45 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('http://testapp.ourhost.com:80')
  .get('/')
  .reply(200, "", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:46 GMT',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20' });


nock('https://ourhost.com:443')
  .post('/apps/testapp/application')
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:49 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/testapp')
  .reply(200, "{\"name\":\"testapp\",\"staging\":{\"model\":\"node\",\"stack\":\"node0815\"},\"uris\":[\"testapp.ourhost.com\"],\"instances\":1,\"runningInstances\":1,\"resources\":{\"memory\":64,\"disk\":2048,\"fds\":256},\"state\":\"STARTED\",\"services\":[],\"version\":\"231786c3ab9892d75398cfdf8873dd4292b57858-1\",\"env\":[],\"meta\":{\"debug\":null,\"console\":null,\"version\":2,\"created\":1376518250}}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:50 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"7178c5222ba223d6b9eb491c1ffcf338"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .put('/apps/testapp', {"name":"testapp","staging":{"model":"node","stack":"node0815"},"uris":["testapp.ourhost.com"],"instances":1,"runningInstances":1,"resources":{"memory":64,"disk":2048,"fds":256},"state":"STOPPED","services":[],"version":"231786c3ab9892d75398cfdf8873dd4292b57858-1","env":[],"meta":{"debug":null,"console":null,"version":2,"created":1376518250}})
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:53 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/testapp')
  .reply(200, "{\"name\":\"testapp\",\"staging\":{\"model\":\"node\",\"stack\":\"node0815\"},\"uris\":[\"testapp.ourhost.com\"],\"instances\":1,\"runningInstances\":0,\"resources\":{\"memory\":64,\"disk\":2048,\"fds\":256},\"state\":\"STOPPED\",\"services\":[],\"version\":\"bc34648973ae24b413834da0996d898ac4646355-0\",\"env\":[],\"meta\":{\"debug\":null,\"console\":null,\"version\":3,\"created\":1376518254}}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:54 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"59548879f0772173d19a28803b3d1224"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .put('/apps/testapp', {"name":"testapp","staging":{"model":"node","stack":"node0815"},"uris":["testapp.ourhost.com"],"instances":1,"runningInstances":0,"resources":{"memory":64,"disk":2048,"fds":256},"state":"STARTED","services":[],"version":"bc34648973ae24b413834da0996d898ac4646355-0","env":[],"meta":{"debug":null,"console":null,"version":3,"created":1376518254}})
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:54 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('http://testapp.ourhost.com:80')
  .get('/')
  .reply(202, "", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:55 GMT',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20' });


nock('https://ourhost.com:443')
  .delete('/apps/testapp')
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 22:10:56 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });

