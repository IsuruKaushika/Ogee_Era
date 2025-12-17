import React from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { useContext } from 'react';
import { BsCartPlus  } from "react-icons/bs";

const ProductItem = ({id, image, name, price, stockStatus, discount}) => {
    const {currency} = useContext(ShopContext);

    // Function to determine stock status styling
    const getStockStatusStyle = () => {
        switch(stockStatus) {
            case 'In Stock':
                return 'text-gray-600';
            case 'Out of Stock':
                return 'text-gray-600';
            case 'Limited Stock':
                return 'text-orange-500';
            default:
                return 'text-gray-600'; // Default to grey if not specified
        }
    };

    // Function to determine badge styling for out of stock items
    const getBadgeStyle = () => {
        switch(stockStatus) {
            case 'Out of Stock':
                return 'bg-gray-500 text-white';
            case 'Limited Stock':
                return 'bg-orange-500 text-white';
            case 'In Stock':
                return 'bg-gray-600 text-white';
            default:
                return 'bg-gray-600 text-white'; // Default to grey if not specified
        }
    };

    return (
        <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
            <div className='overflow-hidden relative'>
                <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt=" "/>
                {/* Discount Badge */}
                { (
                    <div className="absolute top-0 left-0 m-2">
                        <span className="text-xs font-medium px-2 py-1 inline-block rounded shadow-md bg-gray-900 text-white">
                            {discount}%
                        </span>
                    </div>
                )}
                
                {/* Stock Status Label - Bottom Left Corner of Image */}
                {stockStatus && (
                    <div className='absolute bottom-0 left-0 m-2'>
                        <span className={`text-xs font-medium px-2 py-1 inline-block rounded shadow-md ${getBadgeStyle()}`}>
                            {stockStatus}
                        </span>
                    </div>
                )}

                {/* Add to Cart button - Bottom Right Corner */}
                <div className="absolute bottom-2 right-2 z-10">
                    <ShopContext.Consumer>
                        {({ addToCart }) => (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (typeof addToCart === 'function') addToCart(id, 1);
                                }}
                                className={`bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded shadow-md flex items-center justify-center ${stockStatus === 'Out of Stock' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                aria-label={`Add ${name} to cart`}
                                title="Add to cart"
                                disabled={stockStatus === 'Out of Stock'}
                            >
                                <BsCartPlus   className='w-4 text-white' alt="Add to cart"/>
                            </button>
                        )}
                    </ShopContext.Consumer>
                </div>
            </div>
            <div className='flex justify-between items-center pt-3 pb-1'>
                <p className='text-sm'>{name}</p>
                <p className='text-sm font-medium'>{currency}{price}</p>
            </div>
        </Link>
    )
}

export default ProductItem