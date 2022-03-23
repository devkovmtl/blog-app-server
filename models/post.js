const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const PostSchema = new Schema(
  {
    title: {
      type: String,
      minlength: 1,
      required: true,
    },
    body: {
      type: String,
      minlength: 1,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    isPublished: {
      type: Boolean,
    },
  },
  { timestamps }
);

PostSchema.virtual('createdAtFormatted').get(function () {
  return `${DateTime.fromJSDate(this.createdAt).toLocaleString(
    DateTime.DATE_SHORT
  )}`;
});

PostSchema.virtual('updatedAtFormatted').get(function () {
  return `${DateTime.fromJSDate(this.updatedAt).toLocaleString(
    DateTime.DATE_SHORT
  )}`;
});

module.exports = model('Post', PostSchema);
