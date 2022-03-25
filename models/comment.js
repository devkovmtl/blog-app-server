const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const CommentSchema = new Schema(
  {
    content: {
      type: String,
      minlength: 1,
    },
    // author: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    // },
    username: {
      type: String,
      minlength: 1,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CommentSchema.virtual('createdAtFormatted').get(function () {
  return `${DateTime.fromJSDate(this.createdAt).toLocaleString(
    DateTime.DATE_SHORT
  )}`;
});

module.exports = model('Comment', CommentSchema);
