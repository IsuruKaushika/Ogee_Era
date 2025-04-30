import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

// Enhanced image processing function - standardizes dimensions and optimizes file size
const processImage = async (file, targetWidth = 1200, targetHeight = 1200, maxSizeMB = 5) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions to maintain aspect ratio
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
        
        // Crop the image to square (center crop)
        if (img.width > img.height) {
          // Wide image
          sourceX = (img.width - img.height) / 2;
          sourceWidth = img.height;
        } else {
          // Tall image
          sourceY = (img.height - img.width) / 2;
          sourceHeight = img.width;
        }
        
        // Draw image with white background to ensure consistent format
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        
        // Draw cropped image on the canvas
        ctx.drawImage(
          img,
          sourceX, sourceY,
          sourceWidth, sourceHeight,
          0, 0,
          targetWidth, targetHeight
        );
        
        // Determine quality based on original size
        let quality = 0.9; // Start with high quality
        const originalSize = file.size / 1024 / 1024;
        
        if (originalSize > 8) {
          quality = 0.7;
        } else if (originalSize > 5) {
          quality = 0.8;
        }
        
        // Convert to blob with appropriate quality setting
        canvas.toBlob((blob) => {
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg', // Force JPEG format for consistency
            lastModified: Date.now(),
          });
          
          // Log file information
          console.log(`Image processed: ${file.name}`);
          console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB, New: ${(newFile.size / 1024 / 1024).toFixed(2)}MB`);
          console.log(`Dimensions: ${targetWidth}x${targetHeight}`);
          
          resolve(newFile);
        }, 'image/jpeg', quality);
      };
    };
  });
};

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  
  // Track original and processed images for display
  const [displayImages, setDisplayImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });
  
  // Track if processing is in progress
  const [processing, setProcessing] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('TopWear');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);

  // Handle image selection with standardized processing
  const handleImageSelect = async (e, setImageFunction, imageKey) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setProcessing(true);
      
      // Store the original file URL for preview
      setDisplayImages(prev => ({
        ...prev,
        [imageKey]: URL.createObjectURL(file)
      }));
      
      // Process all images regardless of size to ensure consistency
      const fileSize = file.size / 1024 / 1024; // size in MB
      toast.info(`Processing image (${fileSize.toFixed(2)}MB)...`);
      
      // Standard size for all product images (1200x1200 pixels)
      const processedFile = await processImage(file, 1200, 1200);
      const processedSize = processedFile.size / 1024 / 1024;
      
      setImageFunction(processedFile);
      
      // Update display image to show processed version
      setDisplayImages(prev => ({
        ...prev,
        [imageKey]: URL.createObjectURL(processedFile)
      }));
      
      toast.success(`Image processed: ${fileSize.toFixed(2)}MB → ${processedSize.toFixed(2)}MB`);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image. Please try another one.");
    } finally {
      setProcessing(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('price', price);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('bestseller', bestseller);

      // Validate that at least one image is provided
      if (!image1 && !image2 && !image3 && !image4) {
        toast.error("Please upload at least one product image");
        return;
      }

      // Append images to form data
      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      // Show loading message
      const toastId = toast.loading("Adding product...");
      
      const response = await axios.post(backendUrl + "/api/product/add", formData, { 
        headers: { 
          token,
          'Content-Type': 'multipart/form-data'
        },
        // Add timeout and retry logic
        timeout: 30000
      });
      
      // Update toast message based on response
      if (response.data.success) {
        toast.update(toastId, { 
          render: response.data.message, 
          type: "success", 
          isLoading: false,
          autoClose: 5000
        });
        
        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setDisplayImages({
          image1: null,
          image2: null,
          image3: null,
          image4: null
        });
        setSizes([]);
        setBestseller(false);
      } else {
        toast.update(toastId, { 
          render: response.data.message, 
          type: "error", 
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to add product");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Image{processing && ' (Processing...)' }</p>
        <div className='flex gap-2'>
          <label htmlFor="image1" className={`relative ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image1 || assets.upload_area} 
              alt=''
            />
            <input 
              onChange={(e) => handleImageSelect(e, setImage1, 'image1')} 
              type="file" 
              id="image1" 
              disabled={processing}
              hidden 
              accept="image/*"
            />
          </label>
          <label htmlFor="image2" className={`relative ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image2 || assets.upload_area} 
              alt=''
            />
            <input 
              onChange={(e) => handleImageSelect(e, setImage2, 'image2')} 
              type="file" 
              id="image2" 
              disabled={processing}
              hidden 
              accept="image/*"
            />
          </label>
          <label htmlFor="image3" className={`relative ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image3 || assets.upload_area} 
              alt=''
            />
            <input 
              onChange={(e) => handleImageSelect(e, setImage3, 'image3')} 
              type="file" 
              id="image3" 
              disabled={processing}
              hidden 
              accept="image/*"
            />
          </label>
          <label htmlFor="image4" className={`relative ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image4 || assets.upload_area} 
              alt=''
            />
            <input 
              onChange={(e) => handleImageSelect(e, setImage4, 'image4')} 
              type="file" 
              id="image4" 
              disabled={processing}
              hidden 
              accept="image/*"
            />
          </label>
        </div>
        {processing && (
          <p className="text-sm text-blue-600 mt-1">Processing image, please wait...</p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          All images will be standardized to 1200x1200px square format
        </p>
      </div>
      <div className='w-full'>
        <p>Product Name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type='text' placeholder='Type Here' required />
      </div>

      <div className='w-full'>
        <p>Product Description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type='text' placeholder='Write Content Here' required />
      </div>
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} value={category} className='w-full max-w-[500px] px-3 py-2' required>
            <option value='Men'>Men</option>
            <option value='Women'>Women</option>
            <option value='Kids'>Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product SubCategory</p>
          <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full max-w-[500px] px-3 py-2' required>
            <option value='TopWear'>TopWear</option>
            <option value='BottomWear'>BottomWear</option>
            <option value='WinterWear'>WinterWear</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Product Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full max-w-[180px] px-2 py-2' type='number' placeholder='0' required />
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
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
        <label className='cursor-pointer' htmlFor='bestseller'>Add to BestSeller</label>
      </div>

      <button 
        type="submit" 
        className='w-28 py-3 mt-4 bg-black text-white disabled:bg-gray-400'
        disabled={processing}
      >
        {processing ? 'Processing...' : 'ADD'}
      </button>
    </form>
  );
};

export default Add;