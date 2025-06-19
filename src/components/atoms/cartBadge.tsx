// components/CartTabBadge.tsx
import React from 'react';
import { Text, View } from 'react-native';
import useCartStore from '../../store/cart-store';

const CartTabBadge = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  
  if (totalItems === 0) {
    return null;
  }

  return (
    <View style={{
      position: 'absolute',
      right: -6,
      top: -3,
      backgroundColor: 'red',
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
        {totalItems}
      </Text>
    </View>
  );
};

export default CartTabBadge;