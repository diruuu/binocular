/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState, useRef } from 'react';
import PriceStorage from '../../models/price-storage';
import styles from './styles.scss';

function ChangeCell({ symbol, initialChange }: any) {
  const getStored = () =>
    PriceStorage.instance.getChange(symbol) || initialChange || '0';
  const lastPriceRef = useRef(getStored());
  const [price, setPrice] = useState<string>(getStored());
  const [isIncreasing, setIsIncreasing] = useState<boolean>(getStored() >= 0);

  useEffect(() => {
    const sub = setInterval(() => {
      const priceStored = getStored();
      setPrice(priceStored);
      if (priceStored >= 0) {
        setIsIncreasing(true);
      } else {
        setIsIncreasing(false);
      }
      lastPriceRef.current = priceStored;
    }, 500);
    return () => {
      clearInterval(sub);
    };
  }, []);

  return (
    <div className={isIncreasing ? styles.isIncreasing : styles.isDecreasing}>
      {price}
    </div>
  );
}

export default ChangeCell;
