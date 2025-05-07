import React from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { useContext } from 'react';

const ProductItem = ({id, image, name, price, stockStatus}) => {
    const {currency} = useContext(ShopContext);

    // Function to determine stock status styling
    const getStockStatusStyle = () => {
        switch(stockStatus) {
            case 'In Stock':
                return 'text-green-600';
            case 'Out of Stock':
                return 'text-red-600';
            case 'Limited Stock':
                return 'text-orange-500';
            default:
                return 'text-green-600'; // Default to in stock if not specified
        }
    };

    // Function to determine badge styling for out of stock items
    const getBadgeStyle = () => {
        switch(stockStatus) {
            case 'Out of Stock':
                return 'bg-red-500 text-white';
            case 'Limited Stock':
                return 'bg-orange-500 text-white';
            case 'In Stock':
                return 'bg-green-600 text-white';
            default:
                return 'bg-green-600 text-white'; // Default to in stock if not specified
        }
    };

    return (
        <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
            <div className='overflow-hidden relative'>
                <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt=" "/>
                
                {/* Stock Status Label - Bottom Right Corner of Image */}
                {stockStatus && (
                    <div className='absolute bottom-0 right-0 m-2'>
                        <span className={`text-xs font-medium px-2 py-1 inline-block rounded shadow-md ${getBadgeStyle()}`}>
                            {stockStatus}
                        </span>
                    </div>
                )}
            </div>
            <div className='flex justify-between items-center pt-3 pb-1'>
                <p className='text-sm'>{name}</p>
                <p className='text-sm font-medium'>{currency}{price}</p>
            </div>
        </Link>
    )
}

export default ProductItem