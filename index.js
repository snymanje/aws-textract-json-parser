const getRawDataFunc = require('./getRawDataFunc');
const getFormDataFunc = require('./getFormDataFunc');
const getTableDataFunc = require('./getTableDataFunc');

// @ts-check
module.exports = async data => {
  if (data === undefined || data === null) {
    throw new Error(
      'This function requires the json response from Textract as its input...'
    );
  }

  const getFormData = getFormDataFunc(data);
  const getRawData = getRawDataFunc(data);
  const getTableData = getTableDataFunc(data);

  return {
    getRawData,
    getFormData,
    getTableData
  };
};
