const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const CommentSchema = new Schema(
  {
    body: {
      type: String,
      minlength: 1,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  { timestamps: true }
);

CommentSchema.virtual('createdAtFormatted').get(function () {
  return `${DateTime.fromJSDate(this.createdAt).toLocaleString(
    DateTime.DATE_SHORT
  )}`;
});

module.exports = model('Comment', CommentSchema);
