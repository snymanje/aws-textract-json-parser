module.exports = data => {
  return () => {
    // GET ALL WORD BLOCKS
    const getAllWords = data.Blocks.filter(word => word.BlockType === 'WORD');

    // GET ALL SELECTS BLOCKS
    const getAllSelects = data.Blocks.filter(
      select => select.BlockType === 'SELECTION_ELEMENT'
    );

    const getWords = (childIds = {Ids: []}) => {
      return childIds.Ids.map(id => {
        return getAllWords.filter(word => {
          return word.Id === id;
        });
      });
    };

    const getSelects = (childIds = {Ids: []}) => {
      return childIds.Ids.map(id => {
        return getAllSelects.filter(word => {
          return word.Id === id;
        });
      });
    };

    const buildWords = (words = []) => {
      return words.reduce((fullKey, [word]) => {
        if (!word) return fullKey;
        return `${fullKey} ${(word || {Text: ''}).Text}`.trim();
      }, '');
    };

    return {
      buildWords,
      getSelects,
      getWords
    };
  };
};
