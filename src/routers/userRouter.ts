import express from 'express';
// import multer from 'multer';
import { userRegister, userVerify, userLogin, userVerifyToken } from '../controllers/userControllers.js';
import dotenv from 'dotenv';

dotenv.config();

const userRouter = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });

//body params: uuid, name, email

/* response:
  message: String
*/

userRouter.post('/register', userRegister);

userRouter.post('/verify', userVerify);

userRouter.post('/login', userLogin);

userRouter.post('/verifyToken', userVerifyToken);

// router.get('/getCategories', getCategories);

// router.post('/getSubcategories', getSubcategories);

// router.post('/getServiceProviders', getServiceProviders);

// router.post('/getCustomerDetails', getCustomerDetails);

// router.put('/updateCustomerDetails', updateCustomerDetails);

// router.post('/getServiceProviderData', getServiceProviderData);

// router.post('/getServiceProviderSubcategories', getServiceProviderSubcategories);

// router.post('/placeOrder', placeOrder);

// router.post('/googleLogin', upload.single('image'), async (req, res) => {

//   const photoUrl = req.body.photoUrl

//   var imgPublicId =""

//   await User.findOne({uuid: req.body.uuid}).then( async (user) => {
//     if(user == null){
//       try {
//         await cloudinary.uploader.upload( photoUrl, {
//           folder: 'foodhub/users',
//           resource_type: 'image',
//         }).then( async (result) => {
//           imgPublicId = result.public_id
//           const optimizedUrl = cloudinary.url(imgPublicId, {
//               fetch_format: 'auto',
//               quality: 'auto'
//           });
//           try{
//             const user = new User({
//                 uuid: req.body.uuid,
//                 name: req.body.name,
//                 email: req.body.email,
//                 imgUrl: optimizedUrl,
//                 imgPublicId: imgPublicId
//             });

//             try{
//               const savedUser = await user.save();
//               res.send({message: `${savedUser.name} is now logged in`});
//             }
//             catch(err){
//                 res.status(400).send(err.message);
//             }
//           }catch(err){
//             res.status(400).send(err.message);
//           }
//         })
//       } catch (error) {
//         res.status(500).send('Error adding user item');
//       }
//     }
//   })
// })

export default userRouter;