/* eslint-disable no-undef */
const json = require('./apiResponseSelect');
const awsJsonParser = require('../index');

describe('Selection Elements', () => {
  it('"MasterCard" should be SELECTED', async () => {
    const data = await awsJsonParser(json);
    const [resultSize] = data.getFormData();
    console.log(resultSize);
    expect(resultSize.MasterCard).toBe('SELECTED');
  });

  it('"Discover" should be NOT_SELECTED', async () => {
    const data = await awsJsonParser(json);
    const [resultSize] = data.getFormData();
    expect(resultSize.Discover).toBe('NOT_SELECTED');
  });
});
