export function mapTransactionToDo (data) {
  const { name } = data.token ? data.token.tokenBasic : '';
  const time = data.time * 1000;
  const fromTransactionHash = data.steps[0] && data.steps[0].hash;
  const toTransactionHash = data.steps[2] && data.steps[2].hash;
  const steps = data.steps.map(step => (step.hash ? step : { chainId: step.chainId }));

  return {
    ...data,
    time,
    tokenBasicName: name,
    fromTransactionHash,
    toTransactionHash,
    steps,
  };
}
