const Product  = require("../models/ProductsModelDB");
const Feedback = require("../models/FeedbackModelDB")
const User = require("../models/UserModelDB")
const mongoose = require('mongoose');
const upload = require("../middleware/upload");

// const ProductsController = require("../controllers/ProductControllerDB");

// auth -> authorization
const auth = require("../middleware/AuthMWPermission");

const express = require('express');
const router = express.Router();

const jwt = require("jsonwebtoken");

// getAllProductsCategories
/**
 * @swagger
 * /api/product/categories:
 *   get:
 *     summary: Retrieve all product categories
 *     description: Retrieves a list of distinct product categories along with the count of products in each category.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of product categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   count:
 *                     type: integer
 *                 example:
 *                   - category: "Electronics"
 *                     count: 15
 *                   - category: "Books"
 *                     count: 10
 *       400:
 *         description: Error retrieving categories
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving categories"
 */
router.get("/categories", async (req, res) => {
  try {
    // Get distinct category values using Mongoose aggregate
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category", // Group by the category field
          categoryCount: { $sum: 1 } // Count the number of products per category
        }
      }
    ]);

    // Map the results to the desired format
    const distinctCategories = categories.map(category => ({
      category: category._id, // _id holds the distinct category value
      count: category.categoryCount
    }));

    res.status(200).send(distinctCategories);

  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving categories");
  }
});


// getProductByCategory
/**
 * @swagger
 * /api/product/category/{category}:
 *   get:
 *     summary: Retrieve products by category
 *     description: Retrieves a list of products that belong to the specified category. Transforms `img_url` into an array of image URLs.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: The category of products to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Sample Product"
 *                   category:
 *                     type: string
 *                     example: "Electronics"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 99.99
 *                   img_urls:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["image1.jpg", "image2.jpg"]
 *                   description:
 *                     type: string
 *                     example: "A detailed description of the product."
 *               example:
 *                 - id: 1
 *                   name: "Sample Product"
 *                   category: "Electronics"
 *                   price: 99.99
 *                   img_urls: ["image1.jpg", "image2.jpg"]
 *                   description: "A detailed description of the product."
 *       400:
 *         description: Error retrieving products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving product"
 */
router.get("/category/:category", async (req, res) => {
  try {
    // البحث عن جميع المنتجات في الفئة المطلوبة باستخدام Mongoose
    const products = await Product.find({
      category: req.params.category
    });

    // تحويل كل منتج وفصل img_url إلى مصفوفة
    const transformedProducts = products.map(product => {
      // تحويل بيانات المنتج إلى JSON
      const productData = product.toObject(); // .toObject() بدلاً من .toJSON() في Mongoose

      // تحويل img_url من سلسلة نصية إلى مصفوفة
      if (productData.img_url) {
        productData.img_urls = productData.img_url.split(',');
      } else {
        productData.img_urls = [];
      }

      // // إزالة الحقل الأصلي img_url إذا كنت ترغب في ذلك
      // delete productData.img_url;

      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (err) {
    console.error(err); // تسجيل الخطأ بالكامل للمساعدة في التصحيح
    res.status(400).send("Error retrieving product");
  }
});

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Retrieve all products
 *     description: Retrieves a list of all products. Transforms `img_url` into an array of image URLs.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Sample Product"
 *                   category:
 *                     type: string
 *                     example: "Electronics"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 99.99
 *                   img_urls:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["image1.jpg", "image2.jpg"]
 *                   description:
 *                     type: string
 *                     example: "A detailed description of the product."
 *               example:
 *                 - id: 1
 *                   name: "Sample Product"
 *                   category: "Electronics"
 *                   price: 99.99
 *                   img_urls: ["image1.jpg", "image2.jpg"]
 *                   description: "A detailed description of the product."
 *       400:
 *         description: Error retrieving products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving products"
 */
router.get("/", async (req, res) => {
  try {
    // البحث عن جميع المنتجات باستخدام Mongoose
    const products = await Product.find();

    // تحويل الحقل img_url إلى مصفوفة
    const transformedProducts = products.map(product => {
      // تحويل بيانات المنتج إلى كائن JavaScript
      const productData = product.toObject(); // استخدمنا toObject() بدلاً من toJSON()

      // تحويل img_url من سلسلة نصية إلى مصفوفة
      productData.img_urls = productData.img_url ? productData.img_url.split(',') : [];

      // // حذف الحقل الأصلي img_url إذا كان مطلوباً
      // delete productData.img_url;

      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (err) {
    console.error(err); // تسجيل الخطأ بالكامل للمساعدة في التصحيح
    res.status(400).send("Error retrieving products");
  }
});


// to make product - only admin can add - MW 
// auth
/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Add a new product
 *     description: Adds a new product to the database. Only admin users can add products. Requires file uploads for images.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Product"
 *               description:
 *                 type: string
 *                 example: "A detailed description of the new product."
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 49.99
 *               category:
 *                 type: string
 *                 example: "Books"
 *               prodimg:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of product image files
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product added successfully"
 *       400:
 *         description: Product addition failed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product addition failed. Please check the request data."
 *       403:
 *         description: Unauthorized - Only admins can add products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Only admins can add products"
 */
// router.post("/", upload.array("prodimg", 10), auth, async (req, res) => {
//   try {
//     const imgUrls = req.files.map(file => file.filename);
//     const prod = await Product.create({
//       name: req.body.name,
//       description: req.body.description,
//       price: req.body.price,
//       img_url: imgUrls.join(','), // Save as comma-separated string
//       // prodimg: req.body.path,
//       category: req.body.category,
//     });

//     res.status(200).send("Product added successfully");
//   } catch (err) {
//     console.error('Error:', err);  // Log the complete error for debugging
//     res.status(400).send("Product addition failed. Please check the request data.");
//   }
// });

/**to make product - anyone */ 
router.post("/", upload.array("prodimg", 10), async (req, res) => {
  try {
    // استخراج أسماء الملفات الخاصة بالصور من المرفقات
    const imgUrls = req.files.map(file => file.filename);

    // إنشاء منتج جديد باستخدام Mongoose
    const prod = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      img_url: imgUrls.join(','), // تخزين الروابط كسلسلة مفصولة بفواصل (إذا كنت تفضل استخدام array مباشرة، يمكن تعديل هذا)
      category: req.body.category,
    });

    // حفظ المنتج الجديد في قاعدة البيانات
    await prod.save();

    res.status(200).send("Product added successfully");
  } catch (err) {
    console.error('Error:', err);  // تسجيل الخطأ بالكامل للمساعدة في التصحيح
    res.status(400).send("Product addition failed. Please check the request data.");
  }
});


// search = sort
/**
 * @swagger
 * /api/product/searchsort:
 *   get:
 *     summary: Search and sort products
 *     description: Searches for products based on a search query and sorts them according to the specified criteria. Supports optional category filtering.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter products by name
 *         example: "laptop"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum:
 *             - name_asc
 *             - name_desc
 *             - price_asc
 *             - price_desc
 *         description: Sorting criteria for the product list
 *         example: "price_desc"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *         example: "Electronics"
 *     responses:
 *       200:
 *         description: List of products that match the search query and sorting criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Sample Product"
 *                   category:
 *                     type: string
 *                     example: "Electronics"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 99.99
 *                   img_urls:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["image1.jpg", "image2.jpg"]
 *                   description:
 *                     type: string
 *                     example: "A detailed description of the product."
 *               example:
 *                 - id: 1
 *                   name: "Sample Product"
 *                   category: "Electronics"
 *                   price: 99.99
 *                   img_urls: ["image1.jpg", "image2.jpg"]
 *                   description: "A detailed description of the product."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.get('/searchsort', async (req, res) => {
  const { search = '', sort_by = '', category = '' } = req.query;

  let sort = {};
  if (sort_by === 'name_asc') sort = { name: 1 };
  if (sort_by === 'name_desc') sort = { name: -1 };
  if (sort_by === 'price_asc') sort = { price: 1 };
  if (sort_by === 'price_desc') sort = { price: -1 };

  try {
    const products = await Product.find({
      category: category || { $ne: null }, // Ensuring it works even if category is not provided
      name: { $regex: search, $options: 'i' }, // Case-insensitive search for the product name
    }).sort(sort);

    const transformedProducts = products.map(product => {
      // Clone the product data
      const productData = product.toObject(); // Convert Mongoose document to plain JavaScript object

      // Transform the img_url field from a string to an array
      if (productData.img_url) {
        productData.img_urls = productData.img_url.split(',');
      } else {
        productData.img_urls = [];
      }

      // Remove the original img_url field if desired
      delete productData.img_url;

      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//feedback
/**
 * @swagger
 * /api/product/feedback:
 *   post:
 *     summary: Submit feedback for a product
 *     description: Allows an authenticated user to submit feedback and a rating for a specific product. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product being reviewed
 *                 example: 1
 *               feedback:
 *                 type: string
 *                 description: The feedback text for the product
 *                 example: "Great product, highly recommend!"
 *               rate:
 *                 type: integer
 *                 description: Rating given to the product (1 to 5)
 *                 example: 4
 *             required:
 *               - productId
 *               - feedback
 *               - rate
 *     responses:
 *       200:
 *         description: Feedback added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "feedback on product added successfully"
 *       400:
 *         description: Error adding feedback
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "feedback on product NOT added"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.post("/feedback", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("Access Denied. No token provided.");

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedPayload.userid;

    const { productId, feedback, rate } = req.body;
    if (!productId || !feedback || !rate) {
      return res.status(400).send("Missing required fields: productId, feedback, or rate.");
    }

    // Create feedback using Mongoose
    const newFeedback = new Feedback({
      userId: new mongoose.Types.ObjectId(userid), // Correctly instantiate ObjectId
      productId: new mongoose.Types.ObjectId(productId), // Correctly instantiate ObjectId
      feedback,
      rate
    });

    await newFeedback.save();

    return res.status(200).send("Feedback on product added successfully.");
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(400).send("Failed to add feedback on product.");
  }
});

/**
 * @swagger
 * /api/product/feedbacks/{productId}:
 *   get:
 *     summary: Retrieve all feedbacks for a specific product
 *     description: Fetches all feedbacks and associated user names for a given product ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to retrieve feedbacks for
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: List of feedbacks for the specified product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Feedback ID
 *                     example: 1
 *                   feedback:
 *                     type: string
 *                     description: The feedback text
 *                     example: "Great product, will buy again!"
 *                   rate:
 *                     type: integer
 *                     description: Rating given (1 to 5)
 *                     example: 5
 *                   User:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Name of the user who provided the feedback
 *                         example: "John Doe"
 *               example:
 *                 - id: 1
 *                   feedback: "Great product, will buy again!"
 *                   rate: 5
 *                   User:
 *                     name: "John Doe"
 *       500:
 *         description: Error retrieving feedbacks
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error fetching feedbacks"
 */
router.get("/feedbacks/:productId", async (req, res) => {
  const { productId } = req.params;
  console.log("Received productId:", productId); // Log the received productId

  // Check if the productId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid productId format.");
  }

  try {
      const feedbacks = await Feedback.find({
          productId: new mongoose.Types.ObjectId(productId), // Use the valid ObjectId
      })
      .populate('userId', 'name') // Ensure correct field for user
      .sort({ createdAt: -1 }); // Sort by creation date

      if (feedbacks.length === 0) {
          return res.status(404).send("No feedback found for this product.");
      }

      return res.status(200).json(feedbacks);
  } catch (err) {
      console.error("Error:", err.message);
      res.status(500).send("Error fetching feedbacks.");
  }
});


// // updateProductByID
// router.put("/:id", auth, ProductsController.updateProductByID);

// // deleteProductByID
// router.delete("/:id", auth, ProductsController.deleteProductByID);



// getProductByID
/**
 * @swagger
 * /api/product/prod/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     description: Retrieves a product based on its ID. Transforms `img_url` into an array of image URLs.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Sample Product"
 *                 category:
 *                   type: string
 *                   example: "Electronics"
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 99.99
 *                 img_urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["image1.jpg", "image2.jpg"]
 *                 description:
 *                   type: string
 *                   example: "A detailed description of the product."
 *               example:
 *                 id: 1
 *                 name: "Sample Product"
 *                 category: "Electronics"
 *                 price: 99.99
 *                 img_urls: ["image1.jpg", "image2.jpg"]
 *                 description: "A detailed description of the product."
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product with this id not found"
 *       400:
 *         description: Error retrieving product
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving product"
 */
router.get("/:id", async (req, res) => {
  try {
    // البحث عن منتج باستخدام الـ id عبر Mongoose
    const product = await Product.findById(req.params.id);

    // تحقق من عدم وجود المنتج
    if (!product) {
      return res.status(404).send("Product with this id not found");
    }

    // تحويل بيانات المنتج إلى كائن JavaScript
    const productData = product.toObject();

    // تحويل img_url من سلسلة نصية إلى مصفوفة
    productData.img_urls = productData.img_url ? productData.img_url.split(',') : [];

    res.status(200).send(productData);
  } catch (err) {
    console.error(err); // تسجيل الخطأ بالكامل للمساعدة في التصحيح
    res.status(400).send("Error retrieving product");
  }
});


module.exports = router;