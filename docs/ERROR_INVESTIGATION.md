    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-953031ad9bdfdf10-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:08.308Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.308Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.308Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.311Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.312Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.312Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.312Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.312Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.312Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.312Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.509Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.510Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.512Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.512Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.513Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.513Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.513Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.514Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.514Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.514Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.514Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.515Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.673Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:08.673Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:08.674Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 376ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-93c4e625c6b24b8c-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:08.697Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.697Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.697Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.698Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:08.698Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:08.698Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 402ms
{"timestamp":"2025-05-09T15:34:08.699Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:08.699Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:08.699Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 398ms
{"timestamp":"2025-05-09T15:34:08.699Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:08.699Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:08.699Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 404ms
{"timestamp":"2025-05-09T15:34:08.700Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:08.700Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:08.700Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 404ms
{"timestamp":"2025-05-09T15:34:08.700Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:08.700Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:08.700Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 404ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-ab0ddaa18eb77de1-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-87c532d83740dcec-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-b4ea95e39ea0ec0d-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-98afc59e32e54cd9-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-88408e06fff4d3c9-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:08.723Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.723Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.723Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.726Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.726Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.726Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.730Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.730Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.730Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.732Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.732Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.732Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.732Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:08.732Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:08.732Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:08.775Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.775Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.894Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.894Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.895Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.895Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.895Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.895Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.895Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.895Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:08.896Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:08.896Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.064Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.065Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.065Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 378ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-a9d3fbfb2c481136-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.087Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.088Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.088Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.120Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.120Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.120Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 404ms
{"timestamp":"2025-05-09T15:34:09.122Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.122Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.122Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 416ms
{"timestamp":"2025-05-09T15:34:09.123Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.123Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.123Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 400ms
{"timestamp":"2025-05-09T15:34:09.124Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.124Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.124Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 411ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-ac51d6a0bd049511-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-84fc04f164ebe846-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.133Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.133Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.133Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 409ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-a26ad69963713549-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-a47e702a253c8108-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-8ad53795e570f3d2-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.149Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.149Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.151Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.151Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.151Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.153Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.153Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.153Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.153Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.154Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.154Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.154Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.154Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.154Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.157Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.157Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.157Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.265Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.265Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.265Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.265Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.284Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.284Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.285Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.285Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.286Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.286Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.369Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.369Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.369Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 289ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-929bf0f25a2d6430-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.389Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.389Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.389Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.423Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.423Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.423Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 288ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-8dbfd0f1f07779be-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.432Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.432Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.432Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 289ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-865d7bfa74abb3a2-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.442Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.442Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.442Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.446Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.446Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.446Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.446Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.446Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.498Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.498Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.498Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 364ms
{"timestamp":"2025-05-09T15:34:09.499Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.499Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.499Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 356ms
{"timestamp":"2025-05-09T15:34:09.500Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.500Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.500Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 351ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-88afeef00b60419b-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-a9a5778bed58c413-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-90d7e59047e09684-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.520Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.520Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.520Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.522Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.522Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.522Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.522Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.522Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.522Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.560Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.560Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.563Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.563Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.598Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.598Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.598Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.598Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.598Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:09.598Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:09.667Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.668Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.668Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 289ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-b3edee704e5c23d1-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.693Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.693Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.693Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.770Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.770Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.771Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 332ms
{"timestamp":"2025-05-09T15:34:09.774Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:09.775Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:09.775Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 342ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-89836fef8991297e-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-97c01c10bdfd6c46-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:09.792Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.792Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.792Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:09.795Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:09.795Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:09.795Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:10.125Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:10.125Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:10.127Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:10.127Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:10.127Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 614ms
{"timestamp":"2025-05-09T15:34:10.130Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:10.130Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:10.130Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 618ms
{"timestamp":"2025-05-09T15:34:10.134Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:10.134Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
{"timestamp":"2025-05-09T15:34:10.134Z","level":"info","message":"Marketplace builders request successful","domain":"api","route":"marketplace/builders","totalItems":2,"totalPages":1,"itemsReturned":2}
 GET /api/marketplace/builders?page=1&limit=9&sortBy=featured 200 in 626ms
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-93e9d91cf83df9ad-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-bcad346eec4b468a-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
[clerk debug start: authMiddleware]
  URL debug, {
    "url": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "method": "GET",
    "headers": "{\"accept\":\"*/*\",\"accept-encoding\":\"gzip, deflate\",\"accept-language\":\"en-GB,en;q=0.9\",\"baggage\":\",sentry-environment=development,sentry-release=buildappswith%401.0.0,sentry-public_key=fbc43927da128c3a176f85092ef2bb5c,sentry-trace_id=9f0acb4ec545430398d5ac3351724e98,sentry-sampled=true,sentry-sample_rand=0.5044360683310531,sentry-sample_rate=1\",\"connection\":\"keep-alive\",\"cookie\":\"__clerk_db_jwt=dvb_2weOmr0UrRZVrFZnORksQi8EyU3; __client_uat=0; __next_hmr_refresh_hash__=7ff1395a366469af0849aa81552e4d1685c0eefdaebe0a11; __stripe_mid=ecf7c4a1-fa6c-48d7-bcc8-aab118f178d91cac3a\",\"host\":\"localhost:3000\",\"priority\":\"u=3, i\",\"referer\":\"http://localhost:3000/marketplace\",\"sec-fetch-dest\":\"empty\",\"sec-fetch-mode\":\"cors\",\"sec-fetch-site\":\"same-origin\",\"sentry-trace\":\"9f0acb4ec545430398d5ac3351724e98-8962920bf62bdcd2-1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15\",\"x-forwarded-for\":\"::1\",\"x-forwarded-host\":\"localhost:3000\",\"x-forwarded-port\":\"3000\",\"x-forwarded-proto\":\"http\"}",
    "nextUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured",
    "clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
  }
  Options debug, {
    "debug": true,
    "beforeAuth": false,
    "afterAuth": true
  }
  {
    "auth": "{\"sessionClaims\":null,\"sessionId\":null,\"session\":null,\"userId\":null,\"user\":null,\"actor\":null,\"orgId\":null,\"orgRole\":null,\"orgSlug\":null,\"orgPermissions\":null,\"organization\":null,\"isPublicRoute\":true,\"isApiRoute\":true}",
    "debug": {
      "debug": true,
      "signInUrl": "/login",
      "request": {
        "sourcePage": "/middleware",
        "experimental_clerkUrl": "http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured"
      },
      "apiKey": "",
      "secretKey": "sk_test",
      "audience": "",
      "apiUrl": "https://api.clerk.dev",
      "apiVersion": "v1",
      "frontendApi": "flying-troll-12.clerk.accounts.dev",
      "proxyUrl": "",
      "publishableKey": "pk_test_Zmx5aW5nLXRyb2xsLTEyLmNsZXJrLmFjY291bnRzLmRldiQ",
      "isSatellite": false,
      "domain": "",
      "jwtKey": "",
      "searchParams": {},
      "host": "localhost:3000",
      "forwardedHost": "localhost:3000",
      "forwardedPort": "3000",
      "forwardedProto": "http",
      "referrer": "http://localhost:3000/marketplace",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      "clientUat": "0",
      "status": "signed-out",
      "reason": "standard-signed-out",
      "message": ""
    }
  }
  {
    "mergedHeaders": "{\"x-middleware-next\":\"1\"}"
  }
  Added x-clerk-debug on request
[clerk debug end: authMiddleware] (@clerk/nextjs=4.31.8,next=15.3.1)
{"timestamp":"2025-05-09T15:34:10.156Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:10.156Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:10.156Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:10.158Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:10.158Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:10.158Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:10.158Z","level":"info","message":"Marketplace builders request received","domain":"api","route":"marketplace/builders","url":"http://localhost:3000/api/marketplace/builders?page=1&limit=9&sortBy=featured","method":"GET"}
{"timestamp":"2025-05-09T15:34:10.158Z","level":"debug","message":"Search parameters","domain":"api","route":"marketplace/builders","params":{"page":"1","limit":"9","sortBy":"featured"}}
{"timestamp":"2025-05-09T15:34:10.158Z","level":"debug","message":"Counting builder profiles","domain":"marketplace-service","where":{"searchable":true}}
{"timestamp":"2025-05-09T15:34:10.222Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:10.222Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:10.230Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:10.230Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:10.293Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:10.293Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:10.302Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:10.303Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:10.303Z","level":"debug","message":"Count result","domain":"marketplace-service","total":2}
{"timestamp":"2025-05-09T15:34:10.303Z","level":"debug","message":"Finding builder profiles","domain":"marketplace-service","where":{"searchable":true},"skip":0,"take":9}
{"timestamp":"2025-05-09T15:34:10.379Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"75677d90-bf2f-409f-8019-312fd182b3e6","hasImageUrl":true}
{"timestamp":"2025-05-09T15:34:10.379Z","level":"debug","message":"User fields","domain":"marketplace-service","userId":"cmacatrby00008o9eby4bthl4","hasImageUrl":true}
Marketplace event: {
  type: 'search_query',
  userId: undefined,
  builderId: undefined,
  data: { filters: { sortBy: 'featured' }, page: 1, limit: 9 }
}
