const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  img_url: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Electronics", "Mobiles", "Clothes", "Books", "Home", "Grocery", "Health"],
    required: true,
  },
  show: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: false
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
