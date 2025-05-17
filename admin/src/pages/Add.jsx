import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

// Enhanced image compression helper function with dynamic quality adjustment
const compressImage = async (file, maxSizeMB = 2, qualityTarget = 0.8) => {
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
        let quality = qualityTarget; // Use the provided quality target
        
        // Dynamically adjust quality based on image size
        if (originalSize > 8) {
          quality = 0.5;
        } else if (originalSize > 5) {
          quality = 0.6;
        } else if (originalSize > 3) {
          quality = 0.7;
        }
        
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down dimensions for very large images
        const MAX_DIMENSION = 2000; // Reduced from 4000 to 2000
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const aspectRatio = width / height;
          if (width > height) {
            width = MAX_DIMENSION;
            height = Math.round(width / aspectRatio);
          } else {
            height = MAX_DIMENSION;
            width = Math.round(height * aspectRatio);
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
          
          // If still too large, try again with lower quality
          if (newFile.size / 1024 / 1024 > maxSizeMB && quality > 0.3) {
            // Recursively compress with lower quality
            compressImage(file, maxSizeMB, quality - 0.1).then(resolve);
          } else {
            resolve(newFile);
          }
        }, file.type, quality);
      };
    };
  });
};

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [sizeChart, setSizeChart] = useState(false);
  
  // Track original and compressed images for display
  const [displayImages, setDisplayImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    sizeChart: null
  });
  
  // Track if compression is in progress
  const [compressing, setCompressing] = useState(false);
  
  // Track total size of all images
  const [totalSize, setTotalSize] = useState(0);
  const MAX_TOTAL_SIZE = 9; // Maximum total size in MB

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('TopWear');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);
  const [hasSizeChart, setHasSizeChart] = useState(false);

  // Calculate total size whenever images change
  useEffect(() => {
    const calculateTotalSize = () => {
      let size = 0;
      if (image1) size += image1.size;
      if (image2) size += image2.size;
      if (image3) size += image3.size;
      if (image4) size += image4.size;
      if (sizeChart) size += sizeChart.size;
      
      // Convert to MB
      setTotalSize(size / (1024 * 1024));
    };
    
    calculateTotalSize();
  }, [image1, image2, image3, image4, sizeChart]);

  // Handle image selection with compression if needed
  const handleImageSelect = async (e, setImageFunction, imageKey) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setCompressing(true);
      
      // Store the original file URL for preview
      setDisplayImages(prev => ({
        ...prev,
        [imageKey]: URL.createObjectURL(file)
      }));
      
      // Check how much space we have left
      let currentTotal = totalSize;
      
      // Subtract current image size if replacing an existing image
      if (imageKey === 'image1' && image1) currentTotal -= image1.size / (1024 * 1024);
      if (imageKey === 'image2' && image2) currentTotal -= image2.size / (1024 * 1024);
      if (imageKey === 'image3' && image3) currentTotal -= image3.size / (1024 * 1024);
      if (imageKey === 'image4' && image4) currentTotal -= image4.size / (1024 * 1024);
      if (imageKey === 'sizeChart' && sizeChart) currentTotal -= sizeChart.size / (1024 * 1024);
      
      const fileSize = file.size / 1024 / 1024; // size in MB
      const potentialNewTotal = currentTotal + fileSize;
      
      // Determine max size for this image based on remaining space
      let targetMaxSize = 2; // Default target size
      
      // If adding this image would exceed total limit, compress more aggressively
      if (potentialNewTotal > MAX_TOTAL_SIZE) {
        // Calculate how much space we have left
        const remainingSpace = Math.max(0.5, MAX_TOTAL_SIZE - currentTotal);
        targetMaxSize = remainingSpace;
        toast.info(`Image needs significant optimization to meet ${MAX_TOTAL_SIZE}MB total limit...`);
      }
      
      if (fileSize > targetMaxSize) {
        toast.info(`Optimizing image (${fileSize.toFixed(2)}MB)...`);
        const compressedFile = await compressImage(file, targetMaxSize);
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      // Final check if total size is within limits
      if (totalSize > MAX_TOTAL_SIZE) {
        toast.error(`Total image size (${totalSize.toFixed(2)}MB) exceeds the ${MAX_TOTAL_SIZE}MB limit. Please reduce image sizes.`);
        return;
      }
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('price', price);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('bestseller', bestseller);
      formData.append('hasSizeChart', hasSizeChart);

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);
      sizeChart && formData.append('sizeChart', sizeChart);

      // Show loading message
      const toastId = toast.loading(`Adding product (${totalSize.toFixed(2)}MB)...`);
      
      // Implement axios timeout option to handle slow connections
      const response = await axios.post(backendUrl + "/api/product/add", formData, { 
        headers: { token },
        timeout: 60000, // 60 seconds timeout
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
        resetForm();
      } else {
        toast.update(toastId, { 
          render: response.data.message, 
          type: "error", 
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.log(error);
      if (error.code === 'ECONNABORTED') {
        toast.error("Upload timeout. The images may be too large. Please try optimizing further.");
      } else if (error.response && error.response.status === 413) {
        toast.error("The server rejected the upload because the file size is too large.");
      } else {
        toast.error(error.message || "Failed to add product");
      }
    }
  };

  // Reset form function
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImage1(false);
    setImage2(false);
    setImage3(false);
    setImage4(false);
    setSizeChart(false);
    setDisplayImages({
      image1: null,
      image2: null,
      image3: null,
      image4: null,
      sizeChart: null
    });
    setSizes([]);
    setBestseller(false);
    setHasSizeChart(false);
    setTotalSize(0);
  };

  // Toggle size chart option
  const toggleSizeChart = () => {
    setHasSizeChart(prev => !prev);
    if (!hasSizeChart) {
      // Focus on size chart upload when enabled
      setTimeout(() => {
        const sizeChartInput = document.getElementById('sizeChart');
        if (sizeChartInput) {
          sizeChartInput.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Clear size chart when toggled off
      setSizeChart(false);
      setDisplayImages(prev => ({
        ...prev,
        sizeChart: null
      }));
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <div className="flex justify-between items-center mb-2">
          <p>Upload Image{compressing && ' (Processing...)' }</p>
          <p className={`text-sm ${totalSize > MAX_TOTAL_SIZE ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
            Total: {totalSize.toFixed(2)}MB / {MAX_TOTAL_SIZE}MB
          </p>
        </div>
        <div className='flex gap-2'>
          <label htmlFor="image1" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image1 || assets.upload_area} 
              alt=''
            />
            {image1 && (
              <span className="absolute top-0 right-0 bg-blue-100 text-xs px-1 rounded">
                {(image1.size / (1024 * 1024)).toFixed(1)}MB
              </span>
            )}
            <input 
              onChange={(e) => handleImageSelect(e, setImage1, 'image1')} 
              type="file" 
              id="image1" 
              disabled={compressing}
              hidden 
              accept="image/*"
            />
          </label>
          <label htmlFor="image2" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image2 || assets.upload_area} 
              alt=''
            />
            {image2 && (
              <span className="absolute top-0 right-0 bg-blue-100 text-xs px-1 rounded">
                {(image2.size / (1024 * 1024)).toFixed(1)}MB
              </span>
            )}
            <input 
              onChange={(e) => handleImageSelect(e, setImage2, 'image2')} 
              type="file" 
              id="image2" 
              disabled={compressing}
              hidden 
              accept="image/*"
            />
          </label>
          <label htmlFor="image3" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image3 || assets.upload_area} 
              alt=''
            />
            {image3 && (
              <span className="absolute top-0 right-0 bg-blue-100 text-xs px-1 rounded">
                {(image3.size / (1024 * 1024)).toFixed(1)}MB
              </span>
            )}
            <input 
              onChange={(e) => handleImageSelect(e, setImage3, 'image3')} 
              type="file" 
              id="image3" 
              disabled={compressing}
              hidden 
              accept="image/*"
            />
          </label>
          <label htmlFor="image4" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <img 
              className='w-20 h-20 object-cover border' 
              src={displayImages.image4 || assets.upload_area} 
              alt=''
            />
            {image4 && (
              <span className="absolute top-0 right-0 bg-blue-100 text-xs px-1 rounded">
                {(image4.size / (1024 * 1024)).toFixed(1)}MB
              </span>
            )}
            <input 
              onChange={(e) => handleImageSelect(e, setImage4, 'image4')} 
              type="file" 
              id="image4" 
              disabled={compressing}
              hidden 
              accept="image/*"
            />
          </label>
        </div>
        {compressing && (
          <p className="text-sm text-blue-600 mt-1">Processing image, please wait...</p>
        )}
        {totalSize > MAX_TOTAL_SIZE && (
          <p className="text-sm text-red-600 mt-1">
            Total image size exceeds {MAX_TOTAL_SIZE}MB limit. Please reduce image sizes or quality.
          </p>
        )}
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
            <option value='None'>None</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product SubCategory</p>
          <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full max-w-[500px] px-3 py-2' required>
            <option value='Saree'>Saree</option>
            <option value='Tops'>Tops</option>
            <option value='Dress'>Dress</option>
            <option value='Lungi&Sarong'>Lungi & Sarong</option>
            <option value='HomeAccessories'>Home Accesories</option>
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

      {/* Size Chart Toggle */}
      <div className='flex gap-2 mt-2'>
        <input 
          onChange={toggleSizeChart} 
          checked={hasSizeChart} 
          type="checkbox" 
          id='hasSizeChart' 
        />
        <label className='cursor-pointer' htmlFor='hasSizeChart'>Add Size Chart</label>
      </div>

      {/* Size Chart Upload Section - Only visible when hasSizeChart is true */}
      {hasSizeChart && (
        <div className='mt-2 w-full max-w-[500px]'>
          <p className='mb-2'>Upload Size Chart</p>
          <div className='flex items-center gap-3'>
            <label htmlFor="sizeChart" className={`relative ${compressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <img 
                className='w-32 h-32 object-contain border p-1' 
                src={displayImages.sizeChart || assets.upload_area} 
                alt='Size Chart'
              />
              {sizeChart && (
                <span className="absolute top-0 right-0 bg-blue-100 text-xs px-1 rounded">
                  {(sizeChart.size / (1024 * 1024)).toFixed(1)}MB
                </span>
              )}
              <input 
                onChange={(e) => handleImageSelect(e, setSizeChart, 'sizeChart')} 
                type="file" 
                id="sizeChart" 
                disabled={compressing}
                hidden 
                accept="image/*"
              />
            </label>
            <div className='text-sm text-gray-600'>
              {displayImages.sizeChart ? (
                <p className='text-green-600'>Size chart uploaded</p>
              ) : (
                <p>Upload a clear image of your product's size chart</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
        <label className='cursor-pointer' htmlFor='bestseller'>Add to BestSeller</label>
      </div>

      <button 
        type="submit" 
        className='w-28 py-3 mt-4 bg-black text-white disabled:bg-gray-400'
        disabled={compressing || (hasSizeChart && !sizeChart) || totalSize > MAX_TOTAL_SIZE}
      >
        {compressing ? 'Processing...' : 'ADD'}
      </button>
    </form>
  );
};

export default Add;