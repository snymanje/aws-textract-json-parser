const utilFuncs = require('./utilityFuncs');

module.exports = data => {
  const util = utilFuncs(data)();

  return options => {
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
      const getValueForKey = ([Id]) => {
        const valuesFromKeyValueSet = keyValueSet.filter(
          key => key.EntityTypes[0] === 'VALUE'
        );
        const valueIds = valuesFromKeyValueSet.filter(value => value.Id === Id);

        const valueRelationships = valueIds.map(valueId => {
          const relationship = valueId.Relationships;
          if (relationship !== undefined) return relationship[0];
        });

        return valueRelationships.map(child => {
          if (child !== undefined) {
            const words = util.getWords(child);
            const [[selects]] = util.getSelects(child);
            if (selects) {
              return selects.SelectionStatus;
            }
            const completedWord = util.buildWords(words);
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
          const words = util.getWords(child[1]);
          // Using reduce to turn the list of words into one line
          const completedWord = util.buildWords(words);
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
};
