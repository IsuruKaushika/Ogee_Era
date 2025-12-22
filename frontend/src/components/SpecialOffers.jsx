import React,{useContext} from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import { useEffect, useState } from 'react';

const SpecialOffers = () => {

    const {products} = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    useEffect(() => {
        const discountedProducts = products.filter(item => item.discount > 0);
        setLatestProducts(discountedProducts.slice(0, 10));
    }, [products])


  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"SPECIAL"} text2={"OFFERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-base text-gray-600">
          Elevate Your Wardrobe with the Latest Styles
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            stock={item.stock}
            stockStatus={item.stockStatus}
            discount={item.discount}
          />
        ))}
      </div>
    </div>
  );
}

export default SpecialOffers