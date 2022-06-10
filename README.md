# token-bucket-calculator
Token Bucket Calculator

## install
```shell
npm i token-bucket-calculator
```

## example
```js
const { TokenBucketCalculator } = require('../dist/index');

const tb = new TokenBucketCalculator({
  bucketSize: 10,
  fillAmount: 10,
  fillIntervalUnit: 'sec',
});

const test = async () => {
  let start = performance.now();
  console.log(
    'Estimated time to consume 10 tokens',
    tb.calcTimeForRemovingTokens(10)
  );
  await tb
    .removeTokens(10)
    .then((remainingTokens) =>
      console.log(
        'actual time taken',
        performance.now() - start,
        remainingTokens
      )
    );

  start = performance.now();
  console.log(
    'Estimated time to consume 10 tokens',
    tb.calcTimeForRemovingTokens(10)
  );
  await tb
    .removeTokens(10)
    .then((remainingTokens) =>
      console.log(
        'actual time taken',
        performance.now() - start,
        remainingTokens
      )
    );

  tb.changeFillAmount(5, 'sec');

  start = performance.now();
  console.log(
    'Estimated time to consume 10 tokens',
    tb.calcTimeForRemovingTokens(10)
  );
  await tb
    .removeTokens(10)
    .then((remainingTokens) =>
      console.log(
        'actual time taken',
        performance.now() - start,
        remainingTokens
      )
    );

  start = performance.now();
  console.log(
    'Estimated time to consume 10 tokens',
    tb.calcTimeForRemovingTokens(10)
  );
  await tb
    .removeTokens(10)
    .then((remainingTokens) =>
      console.log(
        'actual time taken',
        performance.now() - start,
        remainingTokens
      )
    );
};

test();
// Result
// Estimated time to consume 10 tokens 1000
// actual time taken 1005.1510000228882 0
// Estimated time to consume 10 tokens 1000
// actual time taken 1015.0025999546051 0
// Estimated time to consume 10 tokens 2000
// actual time taken 1999.7761999964714 0
// Estimated time to consume 10 tokens 2000
// actual time taken 2006.5223999619484 0
```