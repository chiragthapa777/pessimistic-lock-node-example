const autocannon = require('autocannon');

const url = 'http://localhost:4444/posts/like/transaction2/6613857c6f991ab0641844ff'; // Replace with the URL you want to hit
const amount = 100; // Number of requests to make
const concurrency = 10; // Number of concurrent connections

const instance = autocannon({
  url,
  connections: concurrency,
  amount
}, (err, result) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  
  console.log(result);
});

process.once('SIGINT', () => {
  instance.stop();
});


// autocannon http://localhost:4444/posts/like/transaction2/6613857c6f991ab0641844ff -a 100 -c 5 -t 10