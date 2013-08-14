var nock = require('nock');

nock('https://ourhost.com:443')
  .post('/users/me@me.com/tokens', {"password":"mypassword"})
  .reply(200, "{\"token\":\"bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEzNzcxMDg0NzEsInVzZXJfbmFtZSI6Im1lQG1lLmNvbSIsInNjb3BlIjpbImNsb3VkX2NvbnRyb2xsZXIucmVhZCIsImNsb3VkX2NvbnRyb2xsZXIud3JpdGUiLCJvcGVuaWQiLCJwYXNzd29yZC53cml0ZSJdLCJlbWFpbCI6Im1lQG1lLmNvbSIsImF1ZCI6WyJvcGVuaWQiLCJjbG91ZF9jb250cm9sbGVyIiwicGFzc3dvcmQiXSwianRpIjoiYWM5ZjkyYTQtYjFkNS00YTZlLTk3ZDItYjRkNDVhMGYyMzM2IiwidXNlcl9pZCI6Ijg1OTY4YzA2LWZjMGEtNGNkOS04NmJiLWZjM2RjNjRkZTkwZCIsImNsaWVudF9pZCI6InZtYyJ9.vvDkp2_41HhgQobm-oD_uSy0NZhY0JYAoAJJg7bDTiA\"}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:08 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"ef04b674cebf16133664322b19b74405"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/')
  .reply(200, "[]", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:08 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"d751713988987e9331980363e24189ce"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/testapp')
  .reply(404, "{\"code\":301,\"description\":\"Application not found\"}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:09 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .post('/apps', {"name":"testapp","staging":{"model":"node","stack":"node0815"},"uris":["testapp.ourhost.com"],"resources":{"memory":64},"instances":1})
  .reply(302, "{\"result\":\"success\",\"redirect\":\"http://ourhost.com/apps/testapp\"}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:09 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  location: 'http://ourhost.com/apps/testapp',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/testapp')
  .reply(200, "{\"name\":\"testapp\",\"staging\":{\"model\":\"node\",\"stack\":\"node0815\"},\"uris\":[\"testapp.ourhost.com\"],\"instances\":1,\"runningInstances\":0,\"resources\":{\"memory\":64,\"disk\":2048,\"fds\":256},\"state\":\"STOPPED\",\"services\":[],\"version\":\"2a7fa52e815a7cbd5cea5e223349ae38-0\",\"env\":[],\"meta\":{\"debug\":null,\"console\":null,\"version\":1,\"created\":1376514310}}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:10 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"55d967a69b5292eeda27fa188575b9e2"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .delete('/apps/testapp')
  .reply(200, " ", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:10 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .delete('/apps/[object%20Object]')
  .reply(404, "{\"code\":301,\"description\":\"Application not found\"}", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:10 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/apps/')
  .reply(200, "[]", { server: 'nginx',
  date: 'Wed, 14 Aug 2013 21:05:11 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"d751713988987e9331980363e24189ce"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });

