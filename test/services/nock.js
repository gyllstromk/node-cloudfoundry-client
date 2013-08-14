var nock = require('nock');

nock('https://ourhost.com:443')
  .post('/users/me@me.com/tokens', {"password":"mypassword"})
  .reply(200, "{\"token\":\"bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEzNzcwMjQ1ODgsInVzZXJfbmFtZSI6Im1lQG1lLmNvbSIsInNjb3BlIjpbImNsb3VkX2NvbnRyb2xsZXIucmVhZCIsImNsb3VkX2NvbnRyb2xsZXIud3JpdGUiLCJvcGVuaWQiLCJwYXNzd29yZC53cml0ZSJdLCJlbWFpbCI6Im1lQG1lLmNvbSIsImF1ZCI6WyJvcGVuaWQiLCJjbG91ZF9jb250cm9sbGVyIiwicGFzc3dvcmQiXSwianRpIjoiOTljZmVhM2YtNjY5Yy00NjNjLTgwOWUtNmQ4ZDQwNjkzODAyIiwidXNlcl9pZCI6Ijg1OTY4YzA2LWZjMGEtNGNkOS04NmJiLWZjM2RjNjRkZTkwZCIsImNsaWVudF9pZCI6InZtYyJ9.ALILCvLtJBMnAL6IS0YUVwf9KSCzjitT-7KsUxzf31I\"}", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:08 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"d6342dc69b7063fb95e3c2f37011b143"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/services/')
  .reply(200, "[]", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:08 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"d751713988987e9331980363e24189ce"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/services/test')
  .reply(404, "{\"code\":500,\"description\":\"Service not found\"}", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:09 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .post('/services', {"name":"test","vendor":"mongodb","version":"2.4","tier":"free"})
  .reply(200, "{}", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:12 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"99914b932bd37a50b983c5e7c90ae93b"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/services/test')
  .reply(200, "{\"name\":\"test\",\"type\":\"document\",\"vendor\":\"mongodb\",\"provider\":\"core\",\"version\":\"2.4\",\"tier\":\"free\",\"properties\":{},\"meta\":{\"created\":1376420049,\"updated\":1376420052,\"tags\":[\"nosql\",\"document\"],\"version\":1}}", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:12 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"536106ed81bd6e9588b6479f7609a9f7"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/services/')
  .reply(200, "[{\"name\":\"test\",\"type\":\"document\",\"vendor\":\"mongodb\",\"provider\":\"core\",\"version\":\"2.4\",\"tier\":\"free\",\"properties\":{},\"meta\":{\"created\":1376420049,\"updated\":1376420052,\"tags\":[\"nosql\",\"document\"],\"version\":1}}]", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:13 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"2951c2466815105921a0decfc55fe1dc"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .delete('/services/test')
  .reply(200, "{}", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:13 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"99914b932bd37a50b983c5e7c90ae93b"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .delete('/services/test')
  .reply(404, "{\"code\":500,\"description\":\"Service not found\"}", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:14 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/services/')
  .reply(200, "[]", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:14 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  etag: '"d751713988987e9331980363e24189ce"',
  'cache-control': 'max-age=0, private, must-revalidate',
  'x-ua-compatible': 'IE=Edge,chrome=1' });


nock('https://ourhost.com:443')
  .get('/services/test')
  .reply(404, "{\"code\":500,\"description\":\"Service not found\"}", { server: 'nginx',
  date: 'Tue, 13 Aug 2013 18:54:15 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'keep-alive',
  'keep-alive': 'timeout=20',
  'cache-control': 'no-cache',
  'x-ua-compatible': 'IE=Edge,chrome=1' });

