module.exports = data => {
  return options => {
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
};
