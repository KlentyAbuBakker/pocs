const express = require("express");
const { createClient } = require("redis");
const { RateLimiter, Unit } = require('redis-sliding-rate-limiter');

const app = express();

// (async () => {
//   const client = createClient({
//     url: 'redis://localhost:6379'
//   })
// })
 



app.get("/", async (req, res) => {
  let n = 0;
  const client = createClient({
    url: 'redis://localhost:6379'
  })
  await client.connect();

const limiter = new RateLimiter({
  client: client,
  window: {
    unit: Unit.SECOND,
    size: 10,
    subdivisionUnit: Unit.DECISECOND
  },
  limit: 100,
  limitOverhead: 0
})
const key = 'oneRing';

function sleep (milliseconds){
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}


async function calltheAPI(limiterObj){
  const { allowed, remaining, firstExpireAtMs, windowExpireAtMs } = await limiterObj.get(key);
  if(allowed && remaining > 10){
    console.log("Request is allowed so passing through");
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
  
  while(n < 500) {
    await calltheAPI(limiter);
    n++;
  }

  res.send(" This is an example for successful response");
});

app.listen(3000, async () => {
  
    const client = createClient({
      url: 'redis://localhost:6379'
    })
  
  await client.connect();
  console.log("App is listening to this port")
});
