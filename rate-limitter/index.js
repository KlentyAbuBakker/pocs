const express = require("express");
const { createClient } = require("redis");
const { RateLimiter, Unit } = require('redis-sliding-rate-limiter');
const Hubspot = require('hubspot');

const app = express();

// (async () => {
//   const client = createClient({
//     url: 'redis://localhost:6379'
//   })
// })
 



app.get("/", async (req, res) => {
  try {

  console.log("Initializing the process");
  let n = 0;
  const hubspot = new Hubspot({
    apiKey: process.env.HUBSPOT_API_KEY
  })

  const client = createClient({
    url: process.env.REDIS_AUTH_URL || 'redis://test1:Klenty@123@redis-19220.c256.us-east-1-2.ec2.cloud.redislabs.com:19220'
  })
  await client.connect();
 console.log("Connected to Redis");
const limiter = new RateLimiter({
  client: client,
  window: {
    unit: Unit.SECOND,
    size: parseInt(process.env.RATE_LIMIT_SECONDS),
    subdivisionUnit: Unit.DECISECOND
  },
  limit: parseInt(process.env.RATE_LIMIT_REQUESTS),
  limitOverhead: 0
})
const key = 'oneRing';

console.log("Rate limitter configured");

function sleep (milliseconds){
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}


async function calltheAPI(limiterObj){
  
  const { allowed, remaining, firstExpireAtMs, windowExpireAtMs } = await limiterObj.get(key);
  if(allowed && remaining > 10){
    
    console.log("Request is allowed so passing through");
    const contacts = await hubspot.contacts.get({count: (process.env.API_COUNT || 100)});
    console.log(contacts);   
    console.log("Remaining requests " + `${remaining}`);
  } else {
     const dateDiff = new Date(windowExpireAtMs) - new Date();
    //  const requestDiff = Math.abs( dateDiff -(remaining * 1000));
    const  requestDiff = (dateDiff/remaining) - 100;
     console.log("Limit exceed so sleeping and will try again")
     console.log(`the difference in seconds ${dateDiff}, diff for the request - ${requestDiff}  first req expiring time ${ firstExpireAtMs } `);
     console.log(`Remaining requests - ${remaining}`)
     await sleep(requestDiff);
     console.log("Sleep time over and will print now");

  }

}
  
  while(n < parseInt(process.env.LIMIT)) {
    await calltheAPI(limiter);
    n++;
  }

  res.send(" This is an example for successful response");
}
catch (error) {
  res.send(error);
}
});

app.listen((process.env.PORT || 3000), async () => {
  
    const client = createClient({
      url: 'redis://redis-19220.c256.us-east-1-2.ec2.cloud.redislabs.com:19220'
    })
  
  await client.connect();
  console.log(`App listening in port ${process.env.PORT || 3000}`)
});
