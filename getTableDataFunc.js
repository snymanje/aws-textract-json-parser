const utilFuncs = require('./utilityFuncs');

module.exports = data => {
  const utils = utilFuncs(data)();
  return options => {
    try {
      // GET ALL TABLE BLOCKS
      const tables = data.Blocks.filter(
        table =>
          table.BlockType === 'TABLE' &&
          table.Confidence >
            (options && options.minConfidence ? options.minConfidence : 0)
      );
      // GET ALL CELL BLOCKS
      const getCells = id => {
        return data.Blocks.filter(cells => cells.BlockType === 'CELL').filter(
          cell => cell.Id === id
        );
      };

      const allTables = [];
      tables.forEach(table => {
        const [tableRelationshipIds] = table.Relationships.map(rel => rel.Ids);
        const cellArray = [];
        let tableCells = null;
        tableRelationshipIds.forEach(tableRelationshipId => {
          tableCells = getCells(tableRelationshipId);

          tableCells.forEach(tableCell => {
            const cellIds = tableCell.Relationships;
            // For each id in the child relationships go get the words
            if (cellIds) {
              cellIds.forEach(child => {
                const words = utils.getWords(child);
                // Using reduce to turn the list of words into one line
                const [[selects]] = utils.getSelects(child);
                if (selects) {
                  cellArray.push(selects.SelectionStatus);
                } else {
                  const completedWord = utils.buildWords(words);
                  cellArray.push(completedWord);
                }
              });
            } else {
              cellArray.push('NA');
            }
          });
        });

        const NumberOfColumnsInTable = Math.max(
          ...tableCells.map(tableCell => tableCell.ColumnIndex)
        );

        const tableArray = [];
        [cellArray].forEach(cell => {
          while (cell.length) {
            tableArray.push(cell.splice(0, NumberOfColumnsInTable));
          }
        });

        allTables.push(tableArray);
      });

      const tableRowsAsobjects = [];
      allTables.forEach(table => {
        const headers = table.shift(); // takes first element of array, which is also an array
        const objects = table.map(tableRows => {
          return headers.reduce(
            (accumulator, currentHeaderValue, initialValue) => {
              accumulator[currentHeaderValue] = tableRows[initialValue];
              return accumulator;
            },
            {}
          );
        });
        tableRowsAsobjects.push(objects);
      });

      return tableRowsAsobjects;
    } catch (error) {
      return error;
    }
  };
};
