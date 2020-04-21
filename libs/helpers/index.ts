export const envVarsValidator = <T = object>(expectedVars: T, currentVars: object): T => {
  const expectedKeys: string[] = Object.values(expectedVars);
  const expectedProperties = Object.entries(expectedVars).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

  interface IVarsContainer {
    envVars: T;
    missingKeys: string[];
    missingValues: string[];
  }

  const varsContainer: IVarsContainer = {
    envVars: expectedVars,
    missingKeys: [],
    missingValues: [],
  };

  const result = expectedKeys.reduce<IVarsContainer>((acc, key) => {
    const { envVars, missingKeys, missingValues } = acc;

    const keyIsExists = Object.prototype.hasOwnProperty.call(currentVars, key);
    if (!keyIsExists) {
      return {
        ...acc,
        missingValues,
        missingKeys: [...missingKeys, key],
      };
    }

    const value = currentVars[key];
    const valueIsExists = !!value;
    if (!valueIsExists) {
      return {
        ...acc,
        missingKeys,
        missingValues: [...missingValues, key],
      };
    }

    const propertyName = expectedProperties[key];
    return {
      envVars: {
        ...envVars,
        [propertyName]: value,
      },
      missingKeys,
      missingValues,
    };
  }, varsContainer);

  const { envVars, missingKeys, missingValues } = result;

  const hasMissing = missingKeys.length > 0 || missingValues.length > 0;
  if (hasMissing) {
    const headMessage = 'Environment variables parsing error.';
    const keysMessage = missingKeys.length > 0 ? `Missing keys: ${JSON.stringify(missingKeys)}.` : '';
    const valuesMessage = missingValues.length > 0 ? `Empty values: ${JSON.stringify(missingValues)}.` : '';
    const outputString = [headMessage, keysMessage, valuesMessage].filter(i => i).join(' ');
    throw new Error(outputString);
  } else {
    return envVars;
  }
};
