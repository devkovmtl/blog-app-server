const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    username: {
      type: String,
      minlength: 1,
      maxlength: 100,
      required: true,
    },
    email: {
      type: String,
      minlength: 1,
      maxlength: 100,
      required: true,
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 100,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: 'id',
  foreignField: 'author',
});

module.exports = model('User', UserSchema);
