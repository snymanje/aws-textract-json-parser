// @ts-check
module.exports = async data => {
  if (data === undefined || data === null) {
    throw new Error(
      'This function requires the json response from Textract as its input...'
    );
  }

  // GET ALL WORD BLOCKS
  const getAllWords = data.Blocks.filter(word => word.BlockType === 'WORD');

  const getWords = childIds => {
    return childIds.Ids.map(id => {
      return getAllWords.filter(word => {
        return word.Id === id;
      });
    });
  };

  const buildWords = words => {
    return words.reduce((fullKey, word) => {
      return `${fullKey} ${word[0].Text}`.trim();
    }, '');
  };

  const getFormData = options => {
    try {
      // GET ALL KEY-VALUE BLOCKS WITH ENTITY OF "KEY"
      const keyValueSet = data.Blocks.filter(
        kvp =>
          kvp.BlockType === 'KEY_VALUE_SET' &&
          kvp.Confidence >
            (options && options.minConfidence ? options.minConfidence : 0)
      );

      const forms = [];
      // Get the words that corresponds to the value
      const getValueForKey = Id => {
        const valuesFromKeyValueSet = keyValueSet.filter(
          key => key.EntityTypes[0] === 'VALUE'
        );
        const valueIds = valuesFromKeyValueSet.filter(
          value => value.Id === Id[0]
        );

        const valueRelationships = valueIds.map(valueId => {
          const relationship = valueId.Relationships;
          if (relationship !== undefined) return relationship[0];
        });

        return valueRelationships.map(child => {
          if (child !== undefined) {
            const words = getWords(child);
            const completedWord = buildWords(words);
            return completedWord;
          }
        });
      };

      const getKeys = () => {
        // Filter on all the keys to find text for the key.
        const keys = keyValueSet.filter(key => key.EntityTypes[0] === 'KEY');
        // Return the key relationships
        const keyRelationships = keys.map(key => key.Relationships);
        // For each id in the child relationships go get the words
        keyRelationships.forEach(child => {
          const words = getWords(child[1]);
          // Using reduce to turn the list of words into one line
          const completedWord = buildWords(words);
          const keyValue = getValueForKey(child[0].Ids);
          forms.push([completedWord, keyValue[0]]);
        });

        // Convert vertical array of data into an object
        const formsData = {};
        forms.forEach(form => {
          const key = form.shift();
          const value = form.shift();
          formsData[key] = value;
        });
        return [formsData];
      };
      return getKeys();
    } catch (error) {
      return error;
    }
  };

  const getRawData = options => {
    try {
      // GET ALL LINE BLOCKS
      const lines = data.Blocks.filter(
        line =>
          line.BlockType === 'LINE' &&
          line.Confidence >
            (options && options.minConfidence ? options.minConfidence : 0)
      );

      return lines.map(id => id.Text);
    } catch (error) {
      return error;
    }
  };

  const getTableData = options => {
    try {
      // GET ALL TABLE BLOCKS
      const tables = data.Blocks.filter(
        table =>
          table.BlockType === 'TABLE' &&
          table.Confidence >
            (options && options.minConfidence ? options.minConfidence : 0)
      );
      // GET ALL CELL BLOCKS
      const cells = data.Blocks.filter(cell => cell.BlockType === 'CELL');

      const getCells = id => {
        return cells.filter(cell => cell.Id === id);
      };

      const allTables = [];
      tables.forEach(table => {
        const tableRelationshipIds = table.Relationships.map(rel => rel.Ids);
        const cellArray = [];
        let tableCells = null;
        tableRelationshipIds.flat().forEach(tableRelationshipId => {
          tableCells = getCells(tableRelationshipId);

          tableCells.forEach(tableCell => {
            const cellIds = tableCell.Relationships;
            // For each id in the child relationships go get the words
            if (cellIds) {
              cellIds.forEach(child => {
                const words = getWords(child);
                // Using reduce to turn the list of words into one line
                const completedWord = buildWords(words);
                cellArray.push(completedWord);
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
  return {
    getRawData,
    getFormData,
    getTableData
  };
};
