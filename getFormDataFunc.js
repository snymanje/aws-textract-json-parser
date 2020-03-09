const utilFuncs = require('./utilityFuncs');

module.exports = data => {
  const utils = utilFuncs(data)();

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
        const valueIds = keyValueSet
          .filter(key => key.EntityTypes[0] === 'VALUE')
          .filter(value => value.Id === Id);

        const valueRelationships = valueIds.reduce((result, valueId) => {
          const relationship = valueId.Relationships;
          if (relationship !== undefined) result.push(relationship[0]);
          return result;
        }, []);

        return valueRelationships.reduce((result, child) => {
          if (child !== undefined) {
            const words = utils.getWords(child);
            const [[selects]] = utils.getSelects(child);
            if (selects) {
              result.push(selects.SelectionStatus);
            } else {
              const completedWord = utils.buildWords(words);
              result.push(completedWord);
            }
          }
          return result;
        }, []);
      };

      const getKeys = () => {
        // Filter on all the keys to find text for the key and return the key relationships
        const keyRelationships = keyValueSet
          .filter(key => key.EntityTypes[0] === 'KEY')
          .map(key => key.Relationships);

        // For each id in the child relationships go get the words
        keyRelationships.forEach(child => {
          const { Ids } = child[0];
          const value = child[1];
          const words = utils.getWords(value);
          // Using reduce to turn the list of words into one line
          const completedWord = utils.buildWords(words);
          const { 0: keyValue } = getValueForKey(Ids);
          forms.push([completedWord, keyValue]);
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
