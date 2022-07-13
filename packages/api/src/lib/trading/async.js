module.exports = async (
  inputs,
  f,
  { maxConcurrency },
) => {
  let nextIndex = 0;
  const promises = [];
  const results = new Array(inputs.length);
  for (let i = 0; i < maxConcurrency; i++) {
    promises.push(
      (async () => {
        while (nextIndex < inputs.length) {
          const index = nextIndex++;
          const result = await f(inputs[index]);
          results[index] = result;
        }
      })(),
    );
  }
  await Promise.all(promises);
  return results;
}
