const retry = require("retry");
const { sleep } = require("./lib");

let tryCount = 0;

const myFunc = async () => {
  tryCount++;
  console.log("working on myFunc start");
  await sleep(1000);
  const shouldFail = Math.random() < 0.5;

  //   if (shouldFail) {
  throw new Error("Operation failed");
  //   }
  console.log("working on myFunc end \n --------------");
};

async function retryWrapper(func) {
  const operation = retry.operation({
    retries: 10, // Number of retries so function will be called max 11 time 1 time simple call and 10 time retry
    factor: 2, // Exponential backoff factor
    minTimeout: 100, // Minimum time between retries (in ms)
    maxTimeout: 1000, // Maximum time between retries (in ms)
    randomize: true, // Randomize time between retries
  });

  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        const result = await func();
        resolve(result);
      } catch (err) {
        if (operation.retry(err)) {
          console.log(`Retrying (${currentAttempt})...`);
          return;
        }
        reject(err);
      }
    });
  });
}

async function retryWrapperCustom(func) {
  const maxTries = 10;
  let tries = 0;

  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        const result = await func();
        resolve(result);
      } catch (err) {
        if (operation.retry(err)) {
          console.log(`Retrying (${currentAttempt})...`);
          return;
        }
        reject(err);
      }
    });
  });
}

retryWrapper(myFunc)
  .catch((err) => console.log(err))
  .finally(() => {
    console.log("-------", tryCount);
  });
