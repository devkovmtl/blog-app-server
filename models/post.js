const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const PostSchema = new Schema(
  {
    title: {
      type: String,
      minlength: 1,
      required: true,
    },
    content: {
      type: String,
      minlength: 1,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
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

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});

PostSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
});
module.exports = model('Post', PostSchema);
