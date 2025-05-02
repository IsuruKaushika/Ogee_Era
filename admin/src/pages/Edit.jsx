import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const Edit = ({ token }) => {
  const { id } = useParams();

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [displayImages, setDisplayImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('TopWear');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Add trailing slash to backendUrl if needed
        const baseUrl = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
        
        console.log('Fetching product with ID:', id);
        // Using the correct endpoint that matches your API route
        const response = await axios.get(`${baseUrl}api/product/${id}`, {
          headers: { token }
        });
        
        console.log('API Response:', response.data);
        
        const product = response.data.product;

        if (product) {
          setName(product.name);
          setDescription(product.description);
          setCategory(product.category);
          setSubCategory(product.subCategory);
          setPrice(product.price);
          setSizes(product.sizes || []);
          setBestseller(product.bestseller);

          // Handle image array structure from backend
          // Your backend stores images in an array called 'image'
          setDisplayImages({
            image1: product.image?.[0] || null,
            image2: product.image?.[1] || null,
            image3: product.image?.[2] || null,
            image4: product.image?.[3] || null
          });
          
          setLoading(false);
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Fetch product error:', error);
        setError(error.response?.data?.message || 'Failed to load product');
        toast.error(error.response?.data?.message || 'Failed to load product');
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, token]);

  // Handle new image selection
  const handleImageSelect = (e, imageNumber) => {
    const file = e.target.files[0];
    if (!file) return;

    // Map the image number to the state setter function
    const setters = {
      1: setImage1,
      2: setImage2,
      3: setImage3,
      4: setImage4
    };
    
    // Use the correct setter function
    setters[imageNumber](file);
    
    // Update display image
    const imageKey = `image${imageNumber}`;
    setDisplayImages((prev) => ({
      ...prev,
      [imageKey]: URL.createObjectURL(file)
    }));
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

      if (image1) formData.append('image1', image1);
      if (image2) formData.append('image2', image2);
      if (image3) formData.append('image3', image3);
      if (image4) formData.append('image4', image4);

      const toastId = toast.loading('Updating product...');
      
      // Add trailing slash to backendUrl if needed
      const baseUrl = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;

      const response = await axios.put(`${baseUrl}api/product/${id}`, formData, {
        headers: { token }
      });

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 5000
        });
      } else {
        toast.update(toastId, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Update product error:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading product data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2">Edit Images</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <label htmlFor={`image${i}`} key={i} className="cursor-pointer">
              <img
                className="w-20 h-20 object-cover border"
                src={displayImages[`image${i}`] || assets.upload_area}
                alt=""
              />
              <input
                onChange={(e) => handleImageSelect(e, i)}
                type="file"
                id={`image${i}`}
                hidden
                accept="image/*"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p>Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          required
        />
      </div>

      <div className="w-full">
        <p>Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full max-w-[500px] px-3 py-2"
            required
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product SubCategory</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full max-w-[500px] px-3 py-2"
            required
          >
            <option value="TopWear">TopWear</option>
            <option value="BottomWear">BottomWear</option>
            <option value="WinterWear">WinterWear</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full max-w-[180px] px-2 py-2"
            type="number"
            placeholder="0"
            required
          />
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
            >
              <p
                className={`${
                  sizes.includes(size) ? "bg-blue-200" : "bg-slate-200"
                } px-3 py-1 cursor-pointer`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to BestSeller
        </label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        Update
      </button>
    </form>
  );
};

export default Edit;