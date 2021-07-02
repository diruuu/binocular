/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState, useRef } from 'react';
import PriceStorage from '../../models/price-storage';
import clearTrailingZero from '../../utils/clear-trailing-zero';
import styles from './styles.scss';

function PriceCell({ symbol, initialPrice }: any) {
  const getPriceStored = () =>
    PriceStorage.instance.getPrice(symbol) || initialPrice || '0';
  const lastPriceRef = useRef(getPriceStored());
  const [price, setPrice] = useState<string>(getPriceStored());
  const [isIncreasing, setIsIncreasing] = useState<boolean>(true);

  useEffect(() => {
    const sub = setInterval(() => {
      const priceStored = getPriceStored();
      setPrice(priceStored);
      if (priceStored !== lastPriceRef.current) {
        if (priceStored > lastPriceRef.current) {
          setIsIncreasing(true);
        } else {
          setIsIncreasing(false);
        }
      }
      lastPriceRef.current = priceStored;
    }, 500);
    return () => {
      clearInterval(sub);
    };
  }, []);

  return (
    <div className={isIncreasing ? styles.isIncreasing : styles.isDecreasing}>
      {price && clearTrailingZero(parseFloat(price).toString())}
    </div>
  );
}

export default PriceCell;
