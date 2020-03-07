/* eslint-disable no-undef */
const json = require('./apiResponse3.json');
const awsJsonParser = require('../index');

describe('Raw Data', () => {
  it('At least more than 20 lines should be returned', async () => {
    const data = await awsJsonParser(json);
    const resultSize = data.getRawData();
    expect(resultSize.length).toBeGreaterThan(20);
  });
  it('The first line in the array is "Employment Application"', async () => {
    const data = await awsJsonParser(json);
    const [resultSize] = data.getRawData();
    expect(resultSize).toBe('Employment Application');
  });
});

describe('Form Data', () => {
  it('has one object with 4 properties', async () => {
    const data = await awsJsonParser(json);
    const [resultSize] = data.getFormData();
    expect(Object.keys(resultSize).length).toBe(4);
  });

  it('The first object in the form data has a Phone Number prop === 555-0100', async () => {
    const data = await awsJsonParser(json);
    const [resultSize] = data.getFormData();
    expect(resultSize['Phone Number:']).toBe('555-0100');
  });
});

describe('Table Data', () => {
  it('has one array with 4 object', async () => {
    const data = await awsJsonParser(json);
    const [resultSize] = data.getTableData();
    expect(resultSize.length).toBe(3);
  });

  it('The first object in the array has a "Employee Name" prop === "Any Company"', async () => {
    const data = await awsJsonParser(json);
    const [resultSize] = data.getTableData();
    expect(resultSize[0]['Employer Name']).toBe('Any Company');
  });
});
