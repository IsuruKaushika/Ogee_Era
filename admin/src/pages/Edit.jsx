import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useParams, useNavigate } from 'react-router-dom'

// Image compression helper function
const compressImage = async (file, maxSizeMB = 9.5) => {
  // Return original file if already under the size limit
  if (file.size / 1024 / 1024 < maxSizeMB) {
    return file;
  }
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Calculate scaling factor to get below max size
        const originalSize = file.size / 1024 / 1024; // size in MB
        let quality = 0.9; // Start with high quality
        
        // Decrease quality for very large images
        if (originalSize > 20) {
          quality = 0.7;
        } else if (originalSize > 15) {
          quality = 0.8;
        }
        
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // If image is extremely large, reduce dimensions
        const MAX_DIMENSION = 4000; // Set reasonable max dimension
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const aspectRatio = width / height;
          if (width > height) {
            width = MAX_DIMENSION;
            height = width / aspectRatio;
          } else {
            height = MAX_DIMENSION;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          // Create new file from blob
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          
          resolve(newFile);
        }, file.type, quality);
      };
    };
  });
};

const Edit = ({ token }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  
  // States for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('TopWear');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);
  
  // States for images - null means no change, false means remove, File object means new image
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  
  // Track display images (either existing URLs or newly selected files)
  const [displayImages, setDisplayImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });
  
  // Track if compression is in progress
  const [compressing, setCompressing] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/product/${productId}`);
        
        if (response.data.success) {
          const productData = response.data.product;
          setProduct(productData);
          
          // Set form fields
          setName(productData.name);
          setDescription(productData.description);
          setCategory(productData.category);
          setSubCategory(productData.subCategory);
          setPrice(productData.price.toString());
          setSizes(productData.sizes || []);
          setBestseller(productData.bestseller || false);
          
          // Set display images from Cloudinary URLs
          setDisplayImages({
            image1: productData.images && productData.images[0] ? productData.images[0] : null,
            image2: productData.images && productData.images[1] ? productData.images[1] : null,
            image3: productData.images && productData.images[2] ? productData.images[2] : null,
            image4: productData.images && productData.images[3] ? productData.images[3] : null,
          });
        } else {
          toast.error("Failed to fetch product data");
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Error fetching product data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId, navigate]);

  // Handle image selection with compression if needed
  const handleImageSelect = async (e, setImageFunction, imageKey) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Store the original file URL for preview
    setDisplayImages(prev => ({
      ...prev,
      [imageKey]: URL.createObjectURL(file)
    }));
    
    try {
      setCompressing(true);
      // Check file size and compress if needed
      const fileSize = file.size / 1024 / 1024; // size in MB
      
      if (fileSize > 1) {
        toast.info(`Optimizing image (${fileSize.toFixed(2)}MB) to meet size requirements...`);
        const compressedFile = await compressImage(file);
        const compressedSize = compressedFile.size / 1024 / 1024;
        
        setImageFunction(compressedFile);
        toast.success(`Image optimized: ${fileSize.toFixed(2)}MB → ${compressedSize.toFixed(2)}MB`);
      } else {
        setImageFunction(file);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image. Please try another one.");
    } finally {
      setCompressing(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = (setImageFunction, imageKey) => {
    setDisplayImages(prev => ({
      ...prev,
      [imageKey]: null
    }));
    setImageFunction(false); // false indicates removal
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('price', price);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('bestseller', bestseller);

      // Only append images that have changed
      if (image1 !== null) {
        if (image1 === false) {
          formData.append('removeImage1', true);
        } else {
          formData.append('image1', image1);
        }
      }
      
      if (image2 !== null) {
        if (image2 === false) {
          formData.append('removeImage2', true);
        } else {
          formData.append('image2', image2);
        }
      }
      
      if (image3 !== null) {
        if (image3 === false) {
          formData.append('removeImage3', true);
        } else {
          formData.append('image3', image3);
        }
      }
      
      if (image4 !== null) {
        if (image4 === false) {
          formData.append('removeImage4', true);
        } else {
          formData.append('image4', image4);
        }
      }

      // Show loading message
      const toastId = toast.loading("Updating product...");
      
      const response = await axios.put(`${backendUrl}/api/product/update`, formData, { 
        headers: { token } 
      });
      
      // Update toast message based on response
      if (response.data.success) {
        toast.update(toastId, { 
          render: response.data.message, 
          type: "success", 
          isLoading: false,
          autoClose: 5000
        });
        
        // Navigate back to product list or detail page
        navigate(-1);
      } else {
        toast.update(toastId, { 
          render: response.data.message, 
          type: "error", 
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading product data...</div>;
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
      
      <div>
        <p className='mb-2'>Product Images {compressing && ' (Processing...)' }</p>
        <div className='flex gap-2'>
          <div className="relative">
            <label htmlFor="image1" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <img 
                className='w-20 h-20 object-cover border' 
                src={displayImages.image1 || assets.upload_area} 
                alt=''
              />
              <input 
                onChange={(e) => handleImageSelect(e, setImage1, 'image1')} 
                type="file" 
                id="image1" 
                disabled={compressing}
                hidden 
                accept="image/*"
              />
            </label>
            {displayImages.image1 && (
              <button 
                type="button"
                onClick={() => handleRemoveImage(setImage1, 'image1')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="image2" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <img 
                className='w-20 h-20 object-cover border' 
                src={displayImages.image2 || assets.upload_area} 
                alt=''
              />
              <input 
                onChange={(e) => handleImageSelect(e, setImage2, 'image2')} 
                type="file" 
                id="image2" 
                disabled={compressing}
                hidden 
                accept="image/*"
              />
            </label>
            {displayImages.image2 && (
              <button 
                type="button"
                onClick={() => handleRemoveImage(setImage2, 'image2')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="image3" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <img 
                className='w-20 h-20 object-cover border' 
                src={displayImages.image3 || assets.upload_area} 
                alt=''
              />
              <input 
                onChange={(e) => handleImageSelect(e, setImage3, 'image3')} 
                type="file" 
                id="image3" 
                disabled={compressing}
                hidden 
                accept="image/*"
              />
            </label>
            {displayImages.image3 && (
              <button 
                type="button"
                onClick={() => handleRemoveImage(setImage3, 'image3')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="image4" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <img 
                className='w-20 h-20 object-cover border' 
                src={displayImages.image4 || assets.upload_area} 
                alt=''
              />
              <input 
                onChange={(e) => handleImageSelect(e, setImage4, 'image4')} 
                type="file" 
                id="image4" 
                disabled={compressing}
                hidden 
                accept="image/*"
              />
            </label>
            {displayImages.image4 && (
              <button 
                type="button"
                onClick={() => handleRemoveImage(setImage4, 'image4')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
        {compressing && (
          <p className="text-sm text-blue-600 mt-1">Processing image, please wait...</p>
        )}
      </div>
      
      <div className='w-full'>
        <p>Product Name</p>
        <input 
          onChange={(e) => setName(e.target.value)} 
          value={name} 
          className='w-full max-w-[500px] px-3 py-2 border' 
          type='text' 
          placeholder='Type Here' 
          required 
        />
      </div>

      <div className='w-full'>
        <p>Product Description</p>
        <textarea 
          onChange={(e) => setDescription(e.target.value)} 
          value={description} 
          className='w-full max-w-[500px] px-3 py-2 border' 
          rows="4"
          placeholder='Write Content Here' 
          required 
        />
      </div>
      
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product Category</p>
          <select 
            onChange={(e) => setCategory(e.target.value)} 
            value={category} 
            className='w-full max-w-[500px] px-3 py-2 border' 
            required
          >
            <option value='Men'>Men</option>
            <option value='Women'>Women</option>
            <option value='Kids'>Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product SubCategory</p>
          <select 
            onChange={(e) => setSubCategory(e.target.value)} 
            value={subCategory} 
            className='w-full max-w-[500px] px-3 py-2 border' 
            required
          >
            <option value='TopWear'>TopWear</option>
            <option value='BottomWear'>BottomWear</option>
            <option value='WinterWear'>WinterWear</option>
          </select>
        </div>
        
        <div>
          <p className='mb-2'>Product Price</p>
          <input 
            onChange={(e) => setPrice(e.target.value)} 
            value={price} 
            className='w-full max-w-[180px] px-2 py-2 border' 
            type='number' 
            placeholder='0' 
            required 
          />
        </div>
      </div>
      
      <div>
        <p className='mb-2'>Product Sizes</p>
        <div className='flex gap-3'>
          <div onClick={() => setSizes(prev => prev.includes("S") ? prev.filter(item => item !== "S") : [...prev, "S"])}>
            <p className={`${sizes.includes("S") ? 'bg-blue-200' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>S</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("M") ? prev.filter(item => item !== "M") : [...prev, "M"])}>
            <p className={`${sizes.includes("M") ? 'bg-blue-200' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>M</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("L") ? prev.filter(item => item !== "L") : [...prev, "L"])}>
            <p className={`${sizes.includes("L") ? 'bg-blue-200' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>L</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("XL") ? prev.filter(item => item !== "XL") : [...prev, "XL"])}>
            <p className={`${sizes.includes("XL") ? 'bg-blue-200' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>XL</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("XXL") ? prev.filter(item => item !== "XXL") : [...prev, "XXL"])}>
            <p className={`${sizes.includes("XXL") ? 'bg-blue-200' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>XXL</p>
          </div>
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input 
          onChange={() => setBestseller(prev => !prev)} 
          checked={bestseller} 
          type="checkbox" 
          id='bestseller' 
        />
        <label className='cursor-pointer' htmlFor='bestseller'>Add to BestSeller</label>
      </div>

      <div className="flex gap-4 mt-4">
        <button 
          type="submit" 
          className='w-28 py-3 bg-black text-white disabled:bg-gray-400'
          disabled={compressing || loading}
        >
          {compressing ? 'Processing...' : 'UPDATE'}
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className='w-28 py-3 bg-gray-300'
        >
          CANCEL
        </button>
      </div>
    </form>
  );
};

export default Edit;